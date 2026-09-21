import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { CustomRequest } from '@common/types/data';

@Injectable()
export class CustomRequestContextInitMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		req.db = { mongoose: { session: null } };
		next();
	}
}
