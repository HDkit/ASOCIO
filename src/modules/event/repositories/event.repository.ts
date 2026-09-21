import { Populated, QuerriableType } from '@common/crud/entities';
import { ISoftDeleteBaseRepository } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { Event } from '../entities';

export interface IEventRepository extends ISoftDeleteBaseRepository<Event> {
	findEventsCursorPaginated(
		where: QuerriableType<Event>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Event>[]>;
}

export const IEventRepositoryToken = Symbol('IEventRepository');
