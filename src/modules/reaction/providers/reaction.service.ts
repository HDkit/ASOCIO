import { Inject, Injectable } from '@nestjs/common';

import { Populated } from '@common/crud/entities';
import { CursorPaginationOption } from '@common/types/data';

import { NotificationType } from '@modules/notification/enums';
import { NotificationService } from '@modules/notification/providers';

import { Reaction } from '../entities';
import { IReactionRepository, IReactionRepositoryToken, ReactionCount } from '../repositories';

export type PaginatedReactionUsersListWithCursor = {
	foundUsers: Reaction[];
	nextCursor: string;
};

@Injectable()
export class ReactionService {
	constructor(
		@Inject(IReactionRepositoryToken) private readonly reactionRepository: IReactionRepository,
		private readonly notifcationService: NotificationService,
	) {}

	async upsertReaction(
		options: Pick<Reaction, 'userId' | 'targetId' | 'targetType'>,
		value: number,
	): Promise<Populated<Reaction>> {
		const reaction = await this.reactionRepository.upsert(options, { reactionValue: value });
		await this.notifcationService.createAndSendNotification(NotificationType.REACTED, reaction);
		return reaction;
	}

	async delete(options: Pick<Reaction, 'userId' | 'targetId'>): Promise<Populated<Reaction>> {
		const deletedReaction = this.reactionRepository.findOneByAndDelete(options);
		return deletedReaction;
	}

	async deleteMany(targetIds: string[]): Promise<number> {
		const deletedCount = this.reactionRepository.deleteManyOf(targetIds);
		return deletedCount;
	}

	async getCount(targetIds: string[]): Promise<ReactionCount[]> {
		const count = this.reactionRepository.getCount(targetIds);
		return count;
	}

	async getReactionUsersList(
		targetId: string,
		reactionValue: number,
		options?: CursorPaginationOption<string>,
	): Promise<PaginatedReactionUsersListWithCursor> {
		const usersList = await this.reactionRepository.getReactionUsersList(
			targetId,
			reactionValue,
			options,
		);
		const nextCursor = usersList.at(-1)?.id || '';
		return {
			foundUsers: usersList,
			nextCursor,
		};
	}
}
