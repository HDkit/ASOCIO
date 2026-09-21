import { CursorPaginatedData, OffsetPaginatedData } from './paginated-data.type';

export interface ErrorMessage {
	[key: string]: string;
}

export class ResponseEntity<T> {
	constructor(path: string, statusCode: number, data: T, error?: string | ErrorMessage) {
		this.path = path;
		this.statusCode = statusCode;
		this.timestamp = Date.now();
		if (error) {
			this.success = false;
			this.error = error;
			this.data = null;
		} else {
			this.success = true;
			this.data = data;
		}
	}

	/** API path */
	path: string;

	/** HTTP status code */
	statusCode: number;

	success: boolean;

	timestamp: Date | string | number;

	/** Error message if there's one */
	error?: string | ErrorMessage;

	/** Set as null if there's error */
	data: T | null;
}

export class OffsetPaginatedResponseEntity<T> extends ResponseEntity<T[]> {
	constructor(
		path: string,
		statusCode: number,
		paginatedData: OffsetPaginatedData<T>,
		error?: string,
	) {
		super(path, statusCode, paginatedData.data, error);
		this.page = paginatedData.page;
		this.amount = paginatedData.data.length;
	}

	page: number;
	amount: number;
}

export class CursorPaginatedResponseEntity<T> extends ResponseEntity<T[]> {
	constructor(
		path: string,
		statusCode: number,
		paginatedData: CursorPaginatedData<T>,
		error?: string,
	) {
		super(path, statusCode, paginatedData.data, error);
		this.cursor = paginatedData.cursor;
		this.amount = paginatedData.data.length;
	}

	cursor: string;
	amount: number;
}
