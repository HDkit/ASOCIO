import { IBaseEntity } from '@common/crud/entities';

export enum FriendStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
}

export class Friendship extends IBaseEntity {
	userIds!: [string, string];
	requestedFrom!: string;
	status!: FriendStatus;
}
