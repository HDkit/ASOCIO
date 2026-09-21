import { IsArray, IsInt, IsString } from 'class-validator';

export class OffsetPaginatedData<T> {
	constructor(page: number, limit: number, data: T[]) {
		this.page = page;
		this.data = data;
		this.limit = limit;
	}

	@IsInt()
	page: number = 1;

	@IsInt()
	limit: number = 10;

	// eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
	@IsArray()
	/** Generic array's type can't be inferred unfortunately */
	data: T[] = [];
}

export class CursorPaginatedData<T> {
	constructor(cursor: string, data: T[]) {
		this.cursor = cursor;
		this.data = data;
	}

	@IsString()
	cursor: string;

	// eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
	@IsArray()
	/** Same problem with PaginatedData */
	data: T[] = [];
}
