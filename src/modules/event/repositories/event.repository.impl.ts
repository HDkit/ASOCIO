import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Populated, QuerriableType } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl, SortOptions } from '@common/crud/repos';
import { SortOrder } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { Event } from '../entities';
import { IEventRepository } from './event.repository';

@Injectable()
export class EventRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<Event>
	implements IEventRepository
{
	constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {
		super(eventModel, Event);
	}

	findEventsCursorPaginated(
		where: QuerriableType<Event>,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Event>[]> {
		const filterOptions = {
			...where,
			...(options?.cursor && this.transformFilter({ _id: { $gt: options?.cursor } })),
		};
		const sortOptions: SortOptions<Event> = { createdAt: SortOrder.ASC };
		const limitOptions = options?.limit || 10;
		const foundEvents = this.find(filterOptions, {
			customRepoOptions: { sort: sortOptions },
			limit: limitOptions,
		});
		return foundEvents;
	}
}
