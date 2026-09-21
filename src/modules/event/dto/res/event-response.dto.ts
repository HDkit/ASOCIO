import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ResponseEventDto {
	@Expose()
	@Type(() => String)
	id!: string;

	@Expose()
	@Type(() => String)
	createdBy!: string;

	@Expose()
	keyword!: string[];

	@Expose()
	coverUrl!: string | null;

	@Expose()
	name!: string;

	@Expose()
	description!: string;

	@Expose()
	startAt!: Date;

	@Expose()
	endAt!: Date;

	@Expose()
	location!: string;

	@Expose()
	isPrivate!: boolean;

	@Expose()
	allowInvite!: boolean;

	@Expose()
	isCanceled!: boolean;
}
