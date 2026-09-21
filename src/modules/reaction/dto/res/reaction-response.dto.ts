import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseReactionDto {
	@Expose()
	targetId!: string;

	@Expose()
	reactionValue!: number;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;
}
