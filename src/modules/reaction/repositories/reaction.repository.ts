import { IBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { Reaction } from '../entities';

export type ReactionCount = {
	targetId: string;
	counts: { reactionValue: number; count: number }[];
};

export interface IReactionRepository extends IBaseRepository<Reaction> {
	getCount(targetIds: string[]): Promise<ReactionCount[]>;
	getReactionUsersList(
		targetId: string,
		reactionValue: number,
		options?: CursorPaginationOption<string>,
	): Promise<Reaction[]>;
	deleteManyOf(targetIds: string[]): Promise<number>;
}

export const IReactionRepositoryToken = Symbol('IReactionRepository');
