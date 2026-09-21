import { Populated, QuerriableType } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { SocialPost } from '../entities';

export interface IPostRepository extends ISoftDeleteBaseRepository<SocialPost> {
	fetchFeed(
		where: QuerriableType<SocialPost>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<SocialPost>[]>;

	findOneAndUpdateWithFiles(
		where: QuerriableType<SocialPost>,
		data: Partial<SocialPost>,
		deletedFilesIdx?: number[],
	): Promise<Populated<SocialPost>>;
}

export const IPostRepositoryToken = Symbol('IPostRepository');
