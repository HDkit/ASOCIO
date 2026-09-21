import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

import { DuplicateKeyError } from '@common/exceptions';
import { ErrorMessage, ResponseEntity } from '@common/types/data';

import { AppLoggerService } from '@shared/modules/logger';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: AppLoggerService) {}

	catch(exception: MongoError, host: ArgumentsHost) {
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

	private resolve(exception: MongoError, req: Request): ResponseEntity<null> {
		if (exception.code == 11000) {
			const dupErr = exception as DuplicateKeyError;

			const err: ErrorMessage = {};

			if (dupErr.writeErrors) {
				dupErr.writeErrors.forEach(writeError => {
					if (writeError?.err?.op?.email) {
						err.email = `Email "${writeError.err.op.email}" already exists in the database`;
					}
				});
			} else {
				Object.keys(dupErr.keyValue).forEach(key => {
					err[key] = `${key} already existed inside the database`;
				});
			}

			return new ResponseEntity<null>(req.url, HttpStatus.BAD_REQUEST, null, err);
		}

		return new ResponseEntity<null>(
			req.url,
			HttpStatus.INTERNAL_SERVER_ERROR,
			null,
			exception.message || exception.errmsg,
		);
	}
}
