import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { ResponseTransform } from '@common/decorators';
import { CustomError, EntityNotFound } from '@common/exceptions';
import { ResponseEntity } from '@common/types/data';

import { AppLoggerService } from '@shared/modules/logger';

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	@ResponseTransform()
	catch(exception: CustomError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);

		this.logger.error(
			`Exception Caught - ${req.method} ${req.url}`,
			exception instanceof Error ? exception.stack : String(exception),
		);

		return res.status(resolved.statusCode).json(resolved);
	}

	private resolve(exception: CustomError, req: Request): ResponseEntity<null> {
		const translatedMessage = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: req.headers['accept-language'] || 'en',
			args: { message: exception.message },
		});

		if (exception instanceof EntityNotFound) {
			return new ResponseEntity<null>(req.url, HttpStatus.NOT_FOUND, null, translatedMessage);
		}

		return new ResponseEntity<null>(
			req.url,
			HttpStatus.INTERNAL_SERVER_ERROR,
			null,
			translatedMessage,
		);
	}
}
