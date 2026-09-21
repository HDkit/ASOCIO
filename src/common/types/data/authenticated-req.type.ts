import { Request } from 'express';
import { ClientSession } from 'mongoose';

import { Sub } from '@modules/auth/types';

// passport attaches the return value of the strategy's validate function to request.user
export interface AuthenticatedRequest extends Request {
	user: Sub;
	db: {
		mongoose: {
			session: ClientSession | null;
		};
	};
}

export interface CustomRequest
	extends Partial<Omit<AuthenticatedRequest, 'db'>>,
		Pick<AuthenticatedRequest, 'db'> {}
