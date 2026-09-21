import { MongoServerError } from 'mongodb';

/** interface cuz Mongo stinks and won't provide the proper type for this error */
export interface DuplicateKeyError extends MongoServerError {
	code: 11000;
	keyPattern: Record<string, number>;
	keyValue: Record<string, unknown>;
	errorResponse: {
		index: number;
		code: 11000;
		errmsg: string;
		keyPattern: Record<string, number>;
		keyValue: Record<string, unknown>;
	};
	writeErrors?: Array<{
		err?: {
			op?: {
				[key: string]: any;
				email?: string;
			};
		};
	}>;
}
