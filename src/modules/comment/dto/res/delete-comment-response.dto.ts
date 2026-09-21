import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseDeleteCommentDto {
	@Expose()
	deletedCount!: number;
}
