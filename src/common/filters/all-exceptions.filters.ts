import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { ResponseEntity } from '@common/types/data';

import { AppLoggerService } from '@shared/modules/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: AppLoggerService) {}

	catch(exception: unknown, host: ArgumentsHost) {
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

	private resolve(exception: unknown, req: Request): ResponseEntity<null> {
		return new ResponseEntity<null>(
			req.url,
			HttpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Internal server error',
		);
	}
}
