import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Error, MongooseError } from 'mongoose';

import { ErrorMessage, ResponseEntity } from '@common/types/data';

import { AppLoggerService } from '@shared/modules/logger';

@Catch(MongooseError)
export class MongooseExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: AppLoggerService) {}

	catch(exception: MongooseError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		const resolved = this.resolve(exception, req);

		this.logger.error(
			`Exception Caught - ${req.method} ${req.url}`,
			exception instanceof Error ? exception.stack : exception.message,
		);

		return res.status(resolved.statusCode).json(resolved);
	}

	private resolve(exception: MongooseError, req: Request): ResponseEntity<null> {
		// Validation error
		if (exception instanceof Error.ValidationError) {
			const err: ErrorMessage = {};

			Object.keys(exception.errors).forEach(key => {
				err[key] = exception.errors[key].message;
			});

			return new ResponseEntity<null>(req.url, HttpStatus.BAD_REQUEST, null, err);
		}

		return new ResponseEntity<null>(req.url, HttpStatus.BAD_REQUEST, null, exception.message);
	}
}
