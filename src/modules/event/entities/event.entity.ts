import { ISoftDeletableEntity } from '@common/crud/entities';

export class Event extends ISoftDeletableEntity {
	createdBy!: string;
	keyword!: string[];
	coverUrl!: string | null;
	name!: string;
	description!: string;
	startAt!: Date;
	endAt!: Date;
	location!: string;
	isPrivate!: boolean;
	allowInvite!: boolean;
	isCanceled!: boolean;
}
