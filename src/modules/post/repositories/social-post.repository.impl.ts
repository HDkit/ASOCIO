import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

import { Populated, QuerriableType } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { SocialPost } from '../entities';
import { PostType } from '../enums';
import { IPostRepository } from './social-post.repository';

@Injectable()
export class PostRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<SocialPost>
	implements IPostRepository
{
	constructor(@InjectModel(SocialPost.name) private readonly postModel: Model<SocialPost>) {
		super(postModel, SocialPost, {
			populate: ['userId', 'deletedBy', 'visibleToUsersIds', 'invisibleToUsersIds', 'sharedCount_'],
		});
	}

	async findOneAndUpdateWithFiles(
		where: QuerriableType<SocialPost>,
		data: Partial<SocialPost>,
		deletedFilesIdx?: number[],
	): Promise<Populated<SocialPost>> {
		const foundPost = await this.findOneByOrFail({ ...where, postType: PostType.FILES });
		if (data.fileUrls) {
			data.fileUrls = foundPost.fileUrls?.concat(data.fileUrls);
		} else data.fileUrls = foundPost.fileUrls;
		if (deletedFilesIdx && deletedFilesIdx.length > 0)
			data.fileUrls = data.fileUrls?.filter((_, idx) => !deletedFilesIdx.includes(idx));
		const updatedPost = this.update(foundPost.id, data);
		return updatedPost;
	}

	async fetchFeed(
		where: QuerriableType<SocialPost>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<SocialPost>[]> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const cursorPost = options?.cursor ? await this.findOneByIdOrFail(options.cursor) : undefined;
		const filter: FilterQuery<SocialPost> = where;
		if (cursorPost) {
			filter.$and!.push({
				$or: [
					{ createdAt: { $lt: cursorPost.createdAt } },
					{
						createdAt: cursorPost.createdAt,
						_id: { $lt: new mongoose.Types.ObjectId(cursorPost.id) },
					},
				],
			});
		}
		const foundPosts = (
			await this.postModel
				.find(this.transformFilter(filter))
				.sort({ createdAt: -1, _id: -1 })
				.limit(options?.limit || 10)
				.populate(this.transformPopulate())
				.session(session)
				.exec()
		).map(p => p.toObject());
		return await Promise.all(foundPosts);
	}
}
