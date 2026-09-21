import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { CreateType, Populated } from '@common/crud/entities';
import { MongooseRepositoryImpl, QueryOptions, SortOptions } from '@common/crud/repos';
import { SortOrder } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { Comment } from '../entities';
import { ICommentRepository } from './comment.repository';

type DescendantResult = { descendants: { _id: string }[] };

@Injectable()
export class CommentRepositoryImpl
	extends MongooseRepositoryImpl<Comment>
	implements ICommentRepository
{
	constructor(@InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {
		super(commentModel, Comment, {
			populate: ['userId', 'childrenCount_'],
		});
	}

	async createComment(
		data: CreateType<Comment>,
		queryOptions?: QueryOptions<Comment>,
	): Promise<Populated<Comment>> {
		return this.create(data, queryOptions);
	}

	async findCommentsCursorPaginated(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Comment>[]> {
		const filterOptions = {
			targetId,
			...(options?.cursor && this.transformFilter({ _id: { $gt: options?.cursor } })),
		};
		const sortOptions: SortOptions<Comment> = { createdAt: SortOrder.ASC };
		const limitOptions = options?.limit || 10;
		const foundComments = this.find(filterOptions, {
			customRepoOptions: { sort: sortOptions },
			limit: limitOptions,
		});

		return foundComments;
	}

	async deleteSelfAndDescendants(
		options: Partial<Comment> & Pick<Comment, 'id'>,
	): Promise<string[]> {
		const where = this.transformFilter(options);
		const globalSession = CustomRequestCtx.get().req.db.mongoose.session || null;
		const session = globalSession ?? (await this.commentModel.startSession());
		if (!globalSession) {
			session.startTransaction();
		}

		const matchStage: PipelineStage.Match = { $match: { ...where } };
		// get ancestors of self (not including self)
		const graphLookupStage: PipelineStage.GraphLookup = {
			$graphLookup: {
				from: this.commentModel.collection.name,
				startWith: '$_id',
				connectFromField: '_id',
				connectToField: 'targetId',
				as: 'descendants',
			},
		};
		// match projection with DescendantResult
		const projectStage: PipelineStage.Project = {
			$project: {
				descendants: {
					$map: {
						input: '$descendants',
						as: 'd',
						in: {
							_id: { $toString: '$$d._id' },
						},
					},
				},
			},
		};

		const descendantsResArr = await this.commentModel
			.aggregate<DescendantResult>([matchStage, graphLookupStage, projectStage])
			.session(session);
		// appending self to list of descendants
		const descendants =
			descendantsResArr.length ?
				descendantsResArr[0].descendants.map(d => d._id).concat([where._id])
			:	[where._id];
		const descendantsFilter = { _id: { $in: descendants } };
		await this.commentModel.deleteMany(descendantsFilter).session(session).exec();
		// if this was just local, end the session, else the global session must end elsewhere
		if (!globalSession) {
			await session.commitTransaction();
			await session.endSession();
		}
		return descendants;
	}
}
