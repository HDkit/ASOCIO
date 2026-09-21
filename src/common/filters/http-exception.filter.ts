import {
	ArgumentsHost,
	BadRequestException,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { ResponseTransform } from '@common/decorators';
import { ResponseEntity } from '@common/types/data';

import { AppLoggerService } from '@shared/modules/logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly i18n: I18nService,
		private readonly logger: AppLoggerService,
	) {}

	@ResponseTransform()
	catch(exception: HttpException, host: ArgumentsHost) {
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

	private resolve(exception: HttpException, req: Request): ResponseEntity<null> {
		const excRes = exception.getResponse();
		let message =
			typeof excRes === 'string' ? excRes
			: 'message' in excRes ? (excRes.message as string)
			: 'Unable to parse HttpException message';

		if (exception instanceof BadRequestException && message.includes('Invalid ObjectId')) {
			message = 'Invalid id format, id is a 24 character hexadecimal string';
		}

		const translatedMessage = this.i18n.translate('common.ERROR_MESSAGE', {
			lang: req.headers['accept-language'] || 'en',
			args: { message: message },
		});

		return new ResponseEntity<null>(
			req.url,
			exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR,
			null,
			translatedMessage,
		);
	}
}
