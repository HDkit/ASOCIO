import { Populated } from '@common/crud/entities';
import { IBaseRepository } from '@common/crud/repos';
import { OffsetPaginationOption } from '@common/types/data';

import { Block, FriendStatus, Friendship } from '../entities';

export type FriendshipInfo = Populated<Omit<Friendship, 'userIds'> & { userIds: string }>;

export interface IFriendshipRepository extends IBaseRepository<Friendship> {
	isFriend(uid1: string, uid2: string): Promise<boolean>;
	acceptFriendRequest(uid: string, requestId: string): Promise<Populated<Friendship>>;
	denyFriendRequest(uid: string, requestId: string): Promise<Populated<Friendship>>;
	getFriendship(
		uid: string,
		status: FriendStatus,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]>;
	getFriendshipWithDirection(
		uid: string,
		status: FriendStatus,
		isReceiver: boolean,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]>;
}
export interface IBlockRepository extends IBaseRepository<Block> {
	isBlocked(uid1: string, uid2: string): Promise<boolean>;
}

export const IFriendshipRepositoryToken = Symbol('IFriendshipRepository');
export const IBlockRepositoryToken = Symbol('IBlockRepository');
