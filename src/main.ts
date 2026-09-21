import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';

import { IEnvVars } from '@configs/config';

import { AppLoggerService } from '@shared/modules/logger';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(AppLoggerService);
	app.useLogger(logger);

	const configService = app.get(ConfigService<IEnvVars>);

	// /api/v1

	app.setGlobalPrefix('api');
	app.enableVersioning({
		defaultVersion: '1',
		type: VersioningType.URI,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			forbidUnknownValues: true,
			transform: true,
			transformOptions: {
				excludeExtraneousValues: true,
				exposeUnsetFields: false,
			},
		}),
	);

	// CORS config
	app.enableCors();

	// serve my own doc in a separate file without auto genning
	const openApiSpecPath = path.join(__dirname, '../docs/openapi.json');
	const openApiDocument = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf8')) as OpenAPIObject;
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
