import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { CreateType, Populated } from '@common/crud/entities';
import { Action } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { NotificationService } from '@modules/notification/providers';

import { CaslFilterFactory, FileHostService, UserAbilityOptions } from '@shared/modules';

import { SocialPost } from '../entities';
import { PostType } from '../enums';
import { IPostRepository, IPostRepositoryToken } from '../repositories';

@Injectable()
export class PostService {
	constructor(
		@Inject(IPostRepositoryToken) private readonly postRepository: IPostRepository,
		private readonly fileHostService: FileHostService,
		private readonly caslFilterFactory: CaslFilterFactory,
		private readonly notificationService: NotificationService,
	) {}

	async checkAccessTo(
		id: string,
		action: Action,
		options?: UserAbilityOptions,
	): Promise<SocialPost> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, action, options);
		const foundPost = this.postRepository.findOneByOrFail({ id, ...filter }).catch(() => {
			throw new ForbiddenException();
		});
		return foundPost;
	}

	async createPost(
		data: CreateType<SocialPost> & { files?: MemoryStoredFile[] },
	): Promise<Populated<SocialPost>> {
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdPost = await this.postRepository.create(data);
		await this.notificationService.subscribeToTopic(createdPost.id);
		return createdPost;
	}

	async updatePost(
		id: string,
		postType: PostType,
		data: Partial<SocialPost> & { files?: MemoryStoredFile[]; deletedFilesIdx?: number[] },
	): Promise<Populated<SocialPost> | null> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.UPDATE);
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdPost =
			postType == PostType.FILES ?
				this.postRepository.findOneAndUpdateWithFiles({ id, ...filter }, data, data.deletedFilesIdx)
			:	this.postRepository.findOneByAndUpdate({ id, postType, ...filter }, data);
		return createdPost;
	}

	async deletePost(id: string, deletedById: string | null = null): Promise<Populated<SocialPost>> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.DELETE);
		const deletedPost = this.postRepository.findOneByAndSoftDelete({ id, ...filter }, deletedById);
		return deletedPost;
	}

	async getPost(id: string): Promise<Populated<SocialPost> | null> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.READ);
		const foundPost = this.postRepository.findOneBy({ id, ...filter });
		return foundPost;
	}

	async getFeeds(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<{
		foundPosts: Populated<SocialPost>[];
		nextCursor: string;
	}> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.READ);
		const foundPosts = await this.postRepository.fetchFeed(filter, options);
		const nextCursor = foundPosts.at(-1)?.id || '';
		return { foundPosts, nextCursor };
	}
}
