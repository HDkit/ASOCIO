import { Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { CreateType, Populated } from '@common/crud/entities';
import { CursorPaginationOption } from '@common/types/data';

import { NotificationType } from '@modules/notification/enums';
import { NotificationService } from '@modules/notification/providers';

import { FileHostService, ISessionServiceToken, MongooseSessionService } from '@shared/modules';

import { Event, EventParticipant, EventParticipantRole } from '../entities';
import {
	IEventParticipantRepository,
	IEventParticipantRepositoryToken,
	IEventRepository,
	IEventRepositoryToken,
} from '../repositories';

export type DeleteEventSummary = {
	deletedEvent: Populated<Event>;
	deletedEventMembersCount: number;
};

export type PaginatedEventsWithCursor = {
	foundEvents: Populated<Event>[];
	nextCursor: string;
};

export type PaginatedEventMembersWithCursor = {
	foundMembers: Populated<EventParticipant>[];
	nextCursor: string;
};

@Injectable()
export class EventService {
	constructor(
		@Inject(IEventParticipantRepositoryToken)
		private readonly eventParticipantRepository: IEventParticipantRepository,
		@Inject(IEventRepositoryToken) private readonly eventRepository: IEventRepository,
		@Inject(ISessionServiceToken) private readonly sessionService: MongooseSessionService,
		private readonly fileHostService: FileHostService,
		private readonly notifcationService: NotificationService,
	) {}

	async createEvent(
		data: CreateType<Event> & { cover?: MemoryStoredFile },
	): Promise<Populated<Event>> {
		await this.sessionService.start();
		const createdEvent = await this.eventRepository.create(data);
		if (data.cover) data.coverUrl = await this.fileHostService.file2Url(data.cover);
		await this.eventParticipantRepository.create({
			role: EventParticipantRole.ORGANIZER,
			userId: data.createdBy,
			eventId: createdEvent.id,
		});
		await this.sessionService.end();
		return createdEvent;
	}

	async getEvent(id: string): Promise<Populated<Event>> {
		const foundEvent = this.eventRepository.findOneByIdOrFail(id);
		return foundEvent;
	}

	async getEventMembers(
		eventId: string,
		options?: CursorPaginationOption<string>,
	): Promise<PaginatedEventMembersWithCursor> {
		const foundMembers = await this.eventParticipantRepository.findEventMembersCursorPaginated(
			{
				eventId,
			},
			options,
		);
		const nextCursor = foundMembers.at(-1)?.id || '';
		return { foundMembers, nextCursor };
	}

	async updateEventMember(
		eventId: string,
		userId: string,
		data: Omit<Partial<EventParticipant>, 'eventId' | 'userId'>,
	): Promise<Populated<EventParticipant>> {
		const updatedMember = this.eventParticipantRepository.findOneByAndUpdate(
			{ userId, eventId },
			data,
		);
		return updatedMember;
	}

	async updateEvent(eventId: string, data: Partial<Event>): Promise<Populated<Event>> {
		const updatedEvent = this.eventRepository.findOneByAndUpdate({ id: eventId }, data);
		return updatedEvent;
	}

	async deleteEvent(eventId: string): Promise<Populated<Event>> {
		const deletedEvent = await this.eventRepository.delete(eventId);
		return deletedEvent;
	}

	async inviteUsersToEvent(eventId: string, fromUserId: string, toUserIds: string[]) {
		const foundEvent = await this.eventRepository.findOneByIdOrFail(eventId);
		await this.notifcationService.createAndSendNotification(
			NotificationType.EVENT_INVITE,
			foundEvent,
			fromUserId,
			toUserIds,
		);
	}

	joinEvent(eventId: string, userId: string): Promise<Populated<EventParticipant>> {
		const participatedUser = this.eventParticipantRepository.create({
			eventId,
			userId,
			role: EventParticipantRole.GUEST,
		});
		return participatedUser;
	}

	// [PLA] rewrite this dummy test function
	// take in more precise where options
	async findEvents(
		where: Partial<Event>,
		options?: CursorPaginationOption<string>,
	): Promise<PaginatedEventsWithCursor> {
		const foundEvents = await this.eventRepository.findEventsCursorPaginated(where, options);
		const nextCursor = foundEvents.at(-1)?.id || '';
		return { foundEvents, nextCursor };
	}
}
