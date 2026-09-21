import { CreateType, Populated } from '@common/crud/entities';
import { IBaseRepository, QueryOptions } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { Comment } from '../entities';

export interface ICommentRepository extends IBaseRepository<Comment> {
	createComment(
		data: CreateType<Comment>,
		queryOptions?: QueryOptions<Comment>,
	): Promise<Populated<Comment>>;

	findCommentsCursorPaginated(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Comment>[]>;

	// findDescendants()
	deleteSelfAndDescendants(options: Partial<Comment>): Promise<string[]>;
}

export const ICommentRepositoryToken = Symbol('ICommentRepository');
