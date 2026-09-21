import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RolesGuard } from '@common/guards';

import { IEnvVars, JwtAccessConfig, JwtRefreshConfig } from '@configs';

import { UserModule } from '@modules/user';

import { AuthController } from './controllers';
import { GoogleOAuth2Guard, JwtAuthGuard, JwtRefreshAuthGuard } from './guards';
import { AuthService, TokenService } from './providers';
import { GoogleOAuth2Strategy, JwtRefreshStrategy, JwtStrategy } from './strategies';

@Global()
@Module({
	imports: [PassportModule, forwardRef(() => UserModule)],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtRefreshStrategy,
		GoogleOAuth2Strategy,
		JwtAuthGuard,
		JwtRefreshAuthGuard,
		GoogleOAuth2Guard,
		RolesGuard,
		TokenService,
		AuthService,
		{
			inject: [ConfigService],
			provide: 'JWT_ACCESS_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtAccessConfig(configService);
				return new JwtService(config);
			},
		},
		{
			inject: [ConfigService],
			provide: 'JWT_REFRESH_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtRefreshConfig(configService);
				return new JwtService(config);
			},
		},
	],
	exports: [
		JwtAuthGuard,
		JwtRefreshAuthGuard,
		RolesGuard,
		GoogleOAuth2Guard,
		TokenService,
		AuthService,
	],
})
export class AuthModule {}
