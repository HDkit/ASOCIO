import { Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';

import { PriorityRole, ResponseTransform } from '@common/decorators';
import { Role } from '@common/enums';
import { ValidateIdPipe } from '@common/pipes';
import { AuthenticatedRequest, OffsetPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import {
	GetBlockListDto,
	GetFriendListDto,
	GetFriendRequestsDto,
	ResponseBlockDto,
	ResponseBlockListDto,
	ResponseFriendshipDto,
	ResponseFriendshipListDto,
} from '@modules/relationship/dto';
import { RelationshipService } from '@modules/relationship/providers';

@PriorityRole(Role.USER)
@Controller()
export class UserRelationshipController {
	constructor(private readonly relationshipService: RelationshipService) {}

	@Delete('friends/:requestid')
	async denyFriendRequest(
		@Param('requestid', ValidateIdPipe) requestId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseFriendshipDto> {
		const friendRequest = await this.relationshipService.denyFriendRequest(
			request.user.id,
			requestId,
		);
		return plainToInstanceStrict(ResponseFriendshipDto, friendRequest);
	}

	@Post('friends/:requestid')
	async acceptFriendRequest(
		@Param('requestid', ValidateIdPipe) requestId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseFriendshipDto> {
		const friendRequest = await this.relationshipService.acceptFriendRequest(
			request.user.id,
			requestId,
		);
		return plainToInstanceStrict(ResponseFriendshipDto, friendRequest);
	}

	@Get('friends')
	@ResponseTransform({ pagination: true })
	async getOwnFriendList(
		@Req() request: AuthenticatedRequest,
		@Query() query: GetFriendListDto,
	): Promise<OffsetPaginatedData<ResponseFriendshipListDto>> {
		const foundFriendList = await this.relationshipService.getFriendListOf(request.user.id);
		return new OffsetPaginatedData<ResponseFriendshipListDto>(
			query.page,
			query.limit,
			plainToInstanceStrict(ResponseFriendshipListDto, foundFriendList),
		);
	}

	@Get('friends/requests')
	@ResponseTransform({ pagination: true })
	async getOwnFriendRequest(
		@Query() query: GetFriendRequestsDto,
		@Req() request: AuthenticatedRequest,
	): Promise<OffsetPaginatedData<ResponseFriendshipDto>> {
		const friendRequests = await this.relationshipService.getFriendRequestsOf(
			request.user.id,
			query,
		);
		return new OffsetPaginatedData<ResponseFriendshipDto>(
			query.page,
			query.limit,
			plainToInstanceStrict(ResponseFriendshipDto, friendRequests),
		);
	}

	@Get('friends/my-requests')
	@ResponseTransform({ pagination: true })
	async getOutgoingFriendRequest(
		@Query() query: GetFriendRequestsDto,
		@Req() request: AuthenticatedRequest,
	): Promise<OffsetPaginatedData<ResponseFriendshipDto>> {
		const friendRequests = await this.relationshipService.getFriendRequestsFrom(
			request.user.id,
			query,
		);
		return new OffsetPaginatedData<ResponseFriendshipDto>(
			query.page,
			query.limit,
			plainToInstanceStrict(ResponseFriendshipDto, friendRequests),
		);
	}

	@Post('blocks/:userid')
	async block(
		@Param('userid', ValidateIdPipe) userId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseBlockDto> {
		const from = request.user.id;
		const to = userId;
		const block = await this.relationshipService.block(from, to);
		return plainToInstanceStrict(ResponseBlockDto, block);
	}

	@Delete('blocks/:userid')
	async unblock(
		@Param('userid', ValidateIdPipe) userId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseBlockDto> {
		const from = request.user.id;
		const to = userId;
		const block = await this.relationshipService.unblock(from, to);
		return plainToInstanceStrict(ResponseBlockDto, block);
	}

	@Get('blocks')
	@ResponseTransform({ pagination: true })
	async getOwnBlockList(
		@Query() query: GetBlockListDto,
		@Req() request: AuthenticatedRequest,
	): Promise<OffsetPaginatedData<ResponseBlockListDto>> {
		const blockList = await this.relationshipService.getBlockList(request.user.id, query);
		return new OffsetPaginatedData<ResponseBlockListDto>(
			query.page,
			query.limit,
			plainToInstanceStrict(ResponseBlockListDto, blockList),
		);
	}

	@Get(':userid/friends')
	@ResponseTransform({ pagination: true })
	async getFriendListOf(
		@Param('userid', ValidateIdPipe) userId: string,
		@Query() query: GetFriendListDto,
	): Promise<OffsetPaginatedData<ResponseFriendshipListDto>> {
		const foundFriendList = await this.relationshipService.getFriendListOf(userId);
		return new OffsetPaginatedData<ResponseFriendshipListDto>(
			query.page,
			query.limit,
			plainToInstanceStrict(ResponseFriendshipListDto, foundFriendList),
		);
	}

	@Delete(':userid/unfriend')
	async unfriend(
		@Param('userid', ValidateIdPipe) userId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseFriendshipDto> {
		const from = request.user.id;
		const to = userId;
		const friendRequest = await this.relationshipService.unfriend(from, to);
		return plainToInstanceStrict(ResponseFriendshipDto, friendRequest);
	}

	@Post(':userid/friend-request')
	async addFriend(
		@Param('userid', ValidateIdPipe) userId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseFriendshipDto> {
		const from = request.user.id;
		const to = userId;
		const friendRequest = await this.relationshipService.sendFriendRequest(from, to);
		return plainToInstanceStrict(ResponseFriendshipDto, friendRequest);
	}

	@Delete(':userid/friend-request')
	async cancelFriendRequest(
		@Param('userid', ValidateIdPipe) userId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseFriendshipDto> {
		const from = request.user.id;
		const to = userId;
		const friendRequest = await this.relationshipService.cancelFriendRequest(from, to);
		return plainToInstanceStrict(ResponseFriendshipDto, friendRequest);
	}
}
