import { Inject, Injectable } from '@nestjs/common';

import { Populated } from '@common/crud/entities';
import { OffsetPaginationOption } from '@common/types/data';

import { NotificationType } from '@modules/notification/enums';
import { NotificationService } from '@modules/notification/providers';

import { Block, FriendStatus, Friendship } from '../entities';
import { RelationshipType } from '../enums';
import {
	FriendshipInfo,
	IBlockRepository,
	IBlockRepositoryToken,
	IFriendshipRepository,
	IFriendshipRepositoryToken,
} from '../repositories/relationship.repository';

@Injectable()
export class RelationshipService {
	constructor(
		@Inject(IFriendshipRepositoryToken)
		private readonly friendshipRepository: IFriendshipRepository,
		@Inject(IBlockRepositoryToken) private readonly blockRepository: IBlockRepository,
		private readonly notificationService: NotificationService,
	) {}

	async getRelationship(userId: [string, string]): Promise<RelationshipType> {
		const isBlocked = await this.blockRepository.isBlocked(...userId);
		if (isBlocked) return RelationshipType.BLOCKED;
		return this.friendshipRepository
			.isFriend(...userId)
			.then(isFriend => (isFriend ? RelationshipType.FRIEND : RelationshipType.NONE));
	}

	async sendFriendRequest(actor: string, toUserId: string): Promise<Populated<Friendship>> {
		const foundRequest = await this.friendshipRepository.findOneBy({
			userIds: [actor, toUserId].toSorted() as [string, string],
		});
		if (!foundRequest) {
			const createdRequest = await this.friendshipRepository.create({
				userIds: [actor, toUserId].toSorted() as [string, string],
				requestedFrom: actor,
				status: FriendStatus.PENDING,
			});
			await this.notificationService.createAndSendNotification(
				NotificationType.FRIEND_REQUEST,
				createdRequest,
			);
			return createdRequest;
		}
		return foundRequest;
	}

	async cancelFriendRequest(actor: string, toUserId: string): Promise<Populated<Friendship>> {
		return this.friendshipRepository.findOneByAndDelete({
			userIds: [actor, toUserId].toSorted() as [string, string],
			requestedFrom: actor,
			status: FriendStatus.PENDING,
		});
	}

	async denyFriendRequest(actor: string, requestId: string): Promise<Populated<Friendship>> {
		return this.friendshipRepository.denyFriendRequest(actor, requestId);
	}

	async acceptFriendRequest(actor: string, requestId: string): Promise<Populated<Friendship>> {
		const acceptedRequest = await this.friendshipRepository.acceptFriendRequest(actor, requestId);
		await this.notificationService.createAndSendNotification(
			NotificationType.FRIEND_ACCEPTED,
			acceptedRequest,
		);
		return acceptedRequest;
	}

	async unfriend(actor: string, withUserId: string): Promise<Populated<Friendship>> {
		return this.friendshipRepository.findOneByAndDelete({
			userIds: [actor, withUserId].toSorted() as [string, string],
			status: FriendStatus.ACCEPTED,
		});
	}

	async getFriendListOf(uid: string, options?: OffsetPaginationOption): Promise<FriendshipInfo[]> {
		const foundFriends = this.friendshipRepository.getFriendship(
			uid,
			FriendStatus.ACCEPTED,
			options,
		);
		return foundFriends;
	}

	async getFriendRequestsOf(
		uid: string,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]> {
		const foundRequests = this.friendshipRepository.getFriendshipWithDirection(
			uid,
			FriendStatus.PENDING,
			true,
			options,
		);
		return foundRequests;
	}

	async getFriendRequestsFrom(
		uid: string,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]> {
		const foundRequests = this.friendshipRepository.getFriendshipWithDirection(
			uid,
			FriendStatus.PENDING,
			false,
			options,
		);
		return foundRequests;
	}

	async block(actor: string, toUserId: string): Promise<Populated<Block>> {
		const blockInfo = { fromUserId: actor, toUserId };
		return this.blockRepository.upsert(blockInfo, blockInfo);
	}

	async unblock(actor: string, toUserId: string): Promise<Populated<Block>> {
		return this.blockRepository.findOneByAndDelete({ fromUserId: actor, toUserId });
	}
	async getBlockList(uid: string, options?: OffsetPaginationOption): Promise<Populated<Block>[]> {
		const limitOptions = options?.limit || 10;
		const skipOptions = (options?.page || 0) * limitOptions;
		const foundBlocks = this.blockRepository.find(
			{ fromUserId: uid },
			{
				limit: limitOptions,
				skip: skipOptions,
			},
		);
		return foundBlocks;
	}
}
