import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { MongooseRepositoryImpl } from '@common/crud/repos';
import { EntityNotFound } from '@common/exceptions';
import { OffsetPaginationOption } from '@common/types/data';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { Block, FriendStatus, Friendship } from '../entities';
import { FriendshipInfo, IBlockRepository, IFriendshipRepository } from './relationship.repository';

@Injectable()
export class FriendshipRepositoryImpl
	extends MongooseRepositoryImpl<Friendship>
	implements IFriendshipRepository
{
	constructor(@InjectModel(Friendship.name) private readonly friendshipModel: Model<Friendship>) {
		super(friendshipModel, Friendship, { populate: ['userIds'] });
	}

	async isFriend(uid1: string, uid2: string): Promise<boolean> {
		const filterOptions = this.transformFilter({
			userIds: [uid1, uid2].toSorted() as [string, string],
			status: FriendStatus.ACCEPTED,
		});
		return this.exists(filterOptions);
	}

	async acceptFriendRequest(uid: string, requestId: string): Promise<Populated<Friendship>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter({
			id: requestId,
			userIds: uid,
			requestedFrom: { $ne: uid } as unknown as string,
			status: FriendStatus.PENDING,
		});
		const populateOptions = this.transformPopulate();
		const acceptedRequest = (
			await this.entityModel
				.findOneAndUpdate(filterOptions, { status: FriendStatus.ACCEPTED })
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		if (!acceptedRequest) throw new EntityNotFound(Friendship);
		return acceptedRequest;
	}

	async denyFriendRequest(uid: string, requestId: string): Promise<Populated<Friendship>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter({
			id: requestId,
			userIds: uid,
			requestedFrom: { $ne: uid } as unknown as string,
			status: FriendStatus.PENDING,
		});
		const populateOptions = this.transformPopulate();
		const denied = (
			await this.entityModel
				.findOneAndDelete(filterOptions, { new: true })
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		if (!denied) throw new EntityNotFound(Friendship);
		return denied;
	}

	async getFriendship(
		uid: string,
		status: FriendStatus,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]> {
		const limitOptions = options?.limit || 10;
		const skipOption = (options?.page || 0) * limitOptions;
		const matchStage: PipelineStage.Match = {
			$match: {
				userIds: new mongoose.Types.ObjectId(uid),
				status,
			},
		};
		const skipStage: PipelineStage.Skip = { $skip: skipOption };
		const limitStage: PipelineStage.Limit = { $limit: limitOptions };
		const setStage: PipelineStage.Set = {
			$set: {
				userIds: {
					$arrayElemAt: [
						{
							$filter: {
								input: '$userIds',
								as: 'userId',
								cond: { $ne: ['$$userId', new mongoose.Types.ObjectId(uid)] },
							},
						},
						0,
					],
				},
			},
		};
		const lookupStage: PipelineStage.Lookup = {
			$lookup: {
				from: 'users',
				localField: 'userIds',
				foreignField: '_id',
				as: 'userIdsPopulated',
			},
		};
		const unwindStage: PipelineStage.Unwind = {
			$unwind: '$userIdsPopulated',
		};
		const setPopulatedIdToStringStage: PipelineStage.Set = {
			$set: {
				'userIdsPopulated.id': { $toString: '$userIdsPopulated._id' },
			},
		};
		const convertUserIdToStringStage: PipelineStage.Set = {
			$set: {
				userIds: { $toString: '$userIds' },
				id: { $toString: '$_id' },
			},
		};
		const foundFriendship = this.friendshipModel.aggregate<FriendshipInfo>([
			matchStage,
			skipStage,
			limitStage,
			setStage,
			lookupStage,
			unwindStage,
			setPopulatedIdToStringStage,
			convertUserIdToStringStage,
		]);
		return foundFriendship;
	}

	async getFriendshipWithDirection(
		uid: string,
		status: FriendStatus,
		isReceiver: boolean,
		options?: OffsetPaginationOption,
	): Promise<FriendshipInfo[]> {
		const limitOptions = options?.limit || 10;
		const skipOption = (options?.page || 0) * limitOptions;
		const matchStage: PipelineStage.Match = {
			$match: {
				userIds: new mongoose.Types.ObjectId(uid),
				...(isReceiver ?
					{ requestedFrom: { $ne: new mongoose.Types.ObjectId(uid) } }
				:	{ requestedFrom: new mongoose.Types.ObjectId(uid) }),
				status,
			},
		};
		const skipStage: PipelineStage.Skip = { $skip: skipOption };
		const limitStage: PipelineStage.Limit = { $limit: limitOptions };
		const setStage: PipelineStage.Set = {
			$set: {
				userIds: {
					$arrayElemAt: [
						{
							$filter: {
								input: '$userIds',
								as: 'userId',
								cond: { $ne: ['$$userId', new mongoose.Types.ObjectId(uid)] },
							},
						},
						0,
					],
				},
			},
		};
		const lookupStage: PipelineStage.Lookup = {
			$lookup: {
				from: 'users',
				localField: 'userIds',
				foreignField: '_id',
				as: 'userIdsPopulated',
			},
		};
		const unwindStage: PipelineStage.Unwind = {
			$unwind: '$userIdsPopulated',
		};
		const setPopulatedIdToStringStage: PipelineStage.Set = {
			$set: {
				'userIdsPopulated.id': { $toString: '$userIdsPopulated._id' },
			},
		};
		const convertUserIdToStringStage: PipelineStage.Set = {
			$set: {
				userIds: { $toString: '$userIds' },
				id: { $toString: '$_id' },
			},
		};
		const foundFriendship = this.friendshipModel.aggregate<FriendshipInfo>([
			matchStage,
			skipStage,
			limitStage,
			setStage,
			lookupStage,
			unwindStage,
			setPopulatedIdToStringStage,
			convertUserIdToStringStage,
		]);
		return foundFriendship;
	}
}

@Injectable()
export class BlockRepositoryImpl extends MongooseRepositoryImpl<Block> implements IBlockRepository {
	constructor(@InjectModel(Block.name) private readonly blockModel: Model<Block>) {
		super(blockModel, Block, { populate: ['fromUserId', 'toUserId'] });
	}

	async isBlocked(uid1: string, uid2: string): Promise<boolean> {
		return this.entityModel
			.exists({
				$or: [
					{ fromUserId: uid1, toUserId: uid2 },
					{ fromUserId: uid2, toUserId: uid1 },
				],
			})
			.then(v => (v ? true : false));
	}
}
