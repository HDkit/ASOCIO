import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Populated, QuerriableType } from '@common/crud/entities';
import { MongooseRepositoryImpl, SortOptions } from '@common/crud/repos';
import { SortOrder } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { EventParticipant } from '../entities';
import { IEventParticipantRepository } from './event-participant.repository';

@Injectable()
export class EventParticipantRepositoryImpl
	extends MongooseRepositoryImpl<EventParticipant>
	implements IEventParticipantRepository
{
	constructor(
		@InjectModel(EventParticipant.name)
		private readonly eventParticipantModel: Model<EventParticipant>,
	) {
		super(eventParticipantModel, EventParticipant, { populate: ['userId'] });
	}

	findEventMembersCursorPaginated(
		where: QuerriableType<EventParticipant>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<EventParticipant>[]> {
		const filterOptions = {
			...where,
			...(options?.cursor && this.transformFilter({ _id: { $gt: options?.cursor } })),
		};
		const sortOptions: SortOptions<EventParticipant> = { createdAt: SortOrder.ASC };
		const limitOptions = options?.limit || 10;
		const foundMembers = this.find(filterOptions, {
			customRepoOptions: { sort: sortOptions },
			limit: limitOptions,
		});
		return foundMembers;
	}
}
