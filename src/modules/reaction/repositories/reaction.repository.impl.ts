import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';

import { MongooseRepositoryImpl, SortOptions } from '@common/crud/repos';
import { SortOrder } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { Reaction } from '../entities';
import { IReactionRepository, ReactionCount } from './reaction.repository';

@Injectable()
export class ReactionRepositoryImpl
	extends MongooseRepositoryImpl<Reaction>
	implements IReactionRepository
{
	constructor(@InjectModel(Reaction.name) private readonly reactionModel: Model<Reaction>) {
		super(reactionModel, Reaction);
	}

	async getCount(targetIds: string[]): Promise<ReactionCount[]> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const targetOIds = targetIds.map(id => new mongoose.Types.ObjectId(id));
		const matchStage: PipelineStage.Match = { $match: { targetId: { $in: targetOIds } } };
		const groupByTargetAndReactionStage: PipelineStage.Group = {
			$group: {
				_id: { targetId: '$targetId', reactionValue: '$reactionValue' },
				count: { $sum: 1 },
			},
		};
		const groupByTargetIdStage: PipelineStage.Group = {
			$group: {
				_id: '$_id.targetId',
				counts: {
					$push: {
						reactionValue: '$_id.reactionValue',
						count: '$count',
					},
				},
			},
		};
		const projectStage: PipelineStage.Project = {
			$project: {
				_id: 0,
				targetId: { $toString: '$_id' },
				counts: 1,
			},
		};
		const countedReactions = this.reactionModel
			.aggregate<ReactionCount>([
				matchStage,
				groupByTargetAndReactionStage,
				groupByTargetIdStage,
				projectStage,
			])
			.session(session)
			.exec();

		return countedReactions;
	}

	async getReactionUsersList(
		targetId: string,
		reactionValue: number,
		options?: CursorPaginationOption<string>,
	): Promise<Reaction[]> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter({
			targetId,
			reactionValue,
			...(options?.cursor && { userId: { $gt: new mongoose.Types.ObjectId(options?.cursor) } }),
		});
		const sortOptions: SortOptions<Reaction> = { userId: SortOrder.ASC };
		const limitOptions = options?.limit || 10;
		const populateOptions = this.transformPopulate({ customRepoOptions: { populate: ['userId'] } });

		const query = this.reactionModel
			.find(filterOptions)
			.sort(sortOptions)
			.limit(limitOptions)
			.populate(populateOptions)
			.session(session);
		const cursor = query.cursor();
		const foundReactions: Reaction[] = [];
		for await (const doc of cursor) {
			foundReactions.push(doc.toObject());
		}
		return foundReactions;
	}

	async deleteManyOf(targetIds: string[]): Promise<number> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const targetOIds = targetIds.map(id => new mongoose.Types.ObjectId(id));
		const filter = { targetId: { $in: targetOIds } };
		const deleteResult = await this.reactionModel.deleteMany(filter).session(session);
		return deleteResult.deletedCount;
	}
}
