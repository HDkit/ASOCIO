import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { IsValidId } from '@common/decorators/class-validator';

export class CursorPaginationDto {
	@Expose()
	@IsOptional()
	@IsValidId()
	cursor?: string;

	@Expose()
	@Type(() => Number)
	@IsInt()
	@IsOptional()
	@IsPositive()
	limit: number = 10;
}
