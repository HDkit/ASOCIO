import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Version,
} from '@nestjs/common';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { Populated } from '@common/crud/entities';
import { PriorityRole, ResponseTransform } from '@common/decorators';
import { Role } from '@common/enums';
import { ValidateIdPipe } from '@common/pipes';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { ResponsePostDto } from '@modules/post/dto';
import { PostType } from '@modules/post/enums';
import { PostService } from '@modules/post/providers';

import {
	CreateEventDto,
	InviteEventDto,
	ResponseEventDto,
	SearchEventMembersDto,
	SearchEventsDto,
	ShareEventDto,
	UpdateEventDto,
	UpdateEventMemberDto,
} from '../dto';
import { ResponseEventMemberDto } from '../dto/res/event-member-response.dto';
import { EventService } from '../providers';

@PriorityRole(Role.USER)
@Controller()
export class EventController {
	constructor(
		private readonly eventService: EventService,
		private readonly postService: PostService,
	) {}

	@Version('1')
	@Post('')
	@FormDataRequest({ storage: MemoryStoredFile })
	async createEvent(
		@Body() body: CreateEventDto,
		@Req() request: AuthenticatedRequest,
	): Promise<Populated<ResponseEventDto>> {
		const createdEvent = await this.eventService.createEvent({
			...body,
			createdBy: request.user.id,
			isCanceled: false,
		});
		return plainToInstanceStrict(ResponseEventDto, createdEvent);
	}

	@Version('1')
	@Get(':eventid')
	async getEvent(
		@Param('eventid', ValidateIdPipe) eventId: string,
	): Promise<Populated<ResponseEventDto>> {
		const foundEvent = await this.eventService.getEvent(eventId);
		return plainToInstanceStrict(ResponseEventDto, foundEvent);
	}

	@Version('1')
	@Get(':eventid/members')
	@ResponseTransform({ pagination: true })
	async getEventMembers(
		@Param('eventid', ValidateIdPipe) eventId: string,
		@Query() query: SearchEventMembersDto,
	): Promise<CursorPaginatedData<ResponseEventMemberDto>> {
		const foundEventMembers = await this.eventService.getEventMembers(eventId, query);
		return new CursorPaginatedData(
			foundEventMembers.nextCursor,
			plainToInstanceStrict(ResponseEventMemberDto, foundEventMembers.foundMembers),
		);
	}

	@Version('1')
	@Patch(':eventid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updateEvent(
		@Body() body: UpdateEventDto,
		@Param('eventid', ValidateIdPipe) eventId: string,
	): Promise<Populated<ResponseEventDto>> {
		const updatedEvent = await this.eventService.updateEvent(eventId, body);
		return plainToInstanceStrict(ResponseEventDto, updatedEvent);
	}

	@Version('1')
	@Delete(':eventid')
	async deleteEvent(
		@Param('eventid', ValidateIdPipe) eventId: string,
	): Promise<Populated<ResponseEventDto>> {
		const deletedEvent = await this.eventService.deleteEvent(eventId);
		return plainToInstanceStrict(ResponseEventDto, deletedEvent);
	}

	@Version('1')
	@Patch(':eventid/:userid')
	async updateEventMember(
		@Body() body: UpdateEventMemberDto,
		@Param('eventid', ValidateIdPipe) eventId: string,
		@Param('userid', ValidateIdPipe) userId: string,
	): Promise<Populated<ResponseEventMemberDto>> {
		const updatedMember = await this.eventService.updateEventMember(eventId, userId, body);
		return plainToInstanceStrict(ResponseEventMemberDto, updatedMember);
	}

	@Version('1')
	@Post(':eventid/join')
	async joinEvent(
		@Param('eventid', ValidateIdPipe) eventId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<Populated<ResponseEventMemberDto>> {
		const joinedMember = await this.eventService.joinEvent(eventId, request.user.id);
		return plainToInstanceStrict(ResponseEventMemberDto, joinedMember);
	}

	@Version('1')
	@Get()
	@ResponseTransform({ pagination: true })
	async findEvents(
		@Query() query: SearchEventsDto,
	): Promise<CursorPaginatedData<ResponseEventDto>> {
		const foundEvents = await this.eventService.findEvents({}, query);
		return new CursorPaginatedData(
			foundEvents.nextCursor,
			plainToInstanceStrict(ResponseEventDto, foundEvents.foundEvents),
		);
	}

	@Version('1')
	@Post(':eventid/share')
	async shareEvent(
		@Param('eventid', ValidateIdPipe) eventId: string,
		@Req() request: AuthenticatedRequest,
		@Body() body: ShareEventDto,
	): Promise<Populated<ResponsePostDto>> {
		const createdPost = await this.postService.createPost({
			...body,
			embeddedEventId: eventId,
			userId: request.user.id,
			postType: PostType.EVENT,
		});
		return plainToInstanceStrict(ResponsePostDto, createdPost);
	}

	@Version('1')
	@Post(':eventid/invite')
	async inviteToEvent(
		@Param('eventid', ValidateIdPipe) eventId: string,
		@Body() body: InviteEventDto,
		@Req() req: AuthenticatedRequest,
	) {
		const fromUserId = req.user.id;
		return await this.eventService.inviteUsersToEvent(eventId, fromUserId, body.toUserIds);
	}
}
