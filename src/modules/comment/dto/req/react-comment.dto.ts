import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ReactCommentDto {
	@Expose()
	@IsInt()
	reactionValue!: number;
}
