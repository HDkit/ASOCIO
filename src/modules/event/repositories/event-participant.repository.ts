import { Populated, QuerriableType } from '@common/crud/entities';
import { IBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { EventParticipant } from '../entities';

export interface IEventParticipantRepository extends IBaseRepository<EventParticipant> {
	findEventMembersCursorPaginated(
		where: QuerriableType<EventParticipant>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<EventParticipant>[]>;
}

export const IEventParticipantRepositoryToken = Symbol('IEventParticipantRepository');
