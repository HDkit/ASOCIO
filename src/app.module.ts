import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';

import {
	CustomExceptionFilter,
	GlobalExceptionFilter,
	HttpExceptionFilter,
	MongoExceptionFilter,
	MongooseExceptionFilter,
} from '@common/filters';
import { PriorityRoleGuard, RolesGuard } from '@common/guards';
import { ResponseTransformInterceptor } from '@common/interceptors';
import { CustomRequestContextInitMiddleware } from '@common/middlewares';

import { Config, DatabaseConfig } from '@configs';

import { AdminModule } from '@modules/admin';
import { AuthModule } from '@modules/auth';
import { JwtAuthGuard } from '@modules/auth/guards';
import { CommentModule } from '@modules/comment';
import { DevModule } from '@modules/dev';
import { EventModule } from '@modules/event';
import { NotificationModule } from '@modules/notification';
import { PostModule } from '@modules/post';
import { RelationshipModule } from '@modules/relationship';
import { RouteModule } from '@modules/router';
import { UserModule } from '@modules/user';

import { CustomRequestCtxModule, LoggerModule } from '@shared/modules';

@Module({
	imports: [
		ConfigModule.forRoot({
			expandVariables: true,
			cache: true,
			isGlobal: true,
			load: [Config],
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: DatabaseConfig,
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, '/i18n/'),
				watch: true,
			},
			resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
		}),
		LoggerModule,
		RouteModule,
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 60,
				},
			],
			errorMessage: 'Rate limit reached',
		}),
		CustomRequestCtxModule,
		EventEmitterModule.forRoot({
			wildcard: false,
			delimiter: '.',
			newListener: true,
			removeListener: true,
			maxListeners: 10,
			verboseMemoryLeak: true,
			ignoreErrors: false,
		}),
		/* dev modules for testing */
		ConditionalModule.registerWhen(
			DevModule,
			(env: NodeJS.ProcessEnv) => env.NODE_ENV === 'development',
		),
		/* production modules */
		AuthModule,
		AdminModule,
		EventModule,
		NotificationModule,
		PostModule,
		CommentModule,
		UserModule,
		RelationshipModule,
		EventModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: CustomExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: MongoExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: MongooseExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PriorityRoleGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseTransformInterceptor,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CustomRequestContextInitMiddleware).forRoutes('*');
	}
}
