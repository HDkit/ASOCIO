import { Expose, Type } from 'class-transformer';
import { IsInt } from 'class-validator';

import { CursorPaginationDto } from '@common/types/dto';

export class GetReactionUsersDto extends CursorPaginationDto {
	@Expose()
	@Type(() => Number)
	@IsInt()
	reactionValue!: number;
}
