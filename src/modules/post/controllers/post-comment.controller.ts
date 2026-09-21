import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	Version,
} from '@nestjs/common';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { Populated } from '@common/crud/entities';
import { PriorityRole, ResponseTransform } from '@common/decorators';
import { Action, Role, SystemEntity } from '@common/enums';
import { ValidateIdPipe } from '@common/pipes';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import {
	CreateCommentDto,
	GetCommentsDto,
	ReactCommentDto,
	ResponseCommentDetailedDto,
	ResponseCommentDto,
	UpdateCommentDto,
} from '@modules/comment/dto';
import { PostService } from '@modules/post/providers';
import {
	GetReactionUsersDto,
	ResponseReactionDto,
	ResponseReactionUsersDto,
} from '@modules/reaction/dto';
import { ReactionService } from '@modules/reaction/providers';

import { CommentService, DeletedCommentsSummary } from '../../comment/providers';

@PriorityRole(Role.USER)
@Controller()
export class PostCommentController {
	constructor(
		private readonly postService: PostService,
		private readonly commentService: CommentService,
		private readonly reactionService: ReactionService,
	) {}

	@Version('1')
	@Post(':postid/comments')
	@FormDataRequest({ storage: MemoryStoredFile })
	async createComment(
		@Body() body: CreateCommentDto,
		@Req() request: AuthenticatedRequest,
		@Param('postid', ValidateIdPipe) postId: string,
	): Promise<ResponseCommentDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const createdComment = await this.commentService.createComment({
			...body,
			rootId: postId,
			rootType: SystemEntity.POST,
			targetId: postId,
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponseCommentDto, createdComment);
	}

	@Version('1')
	@Get(':postid/comments')
	@ResponseTransform({ pagination: true })
	async getComments(
		@Param('postid', ValidateIdPipe) postId: string,
		@Query() query: GetCommentsDto,
	): Promise<CursorPaginatedData<Populated<ResponseCommentDto>>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const foundComments = await this.commentService.getCommentsOf(postId, query);
		return new CursorPaginatedData(
			foundComments.nextCursor,
			plainToInstanceStrict(ResponseCommentDetailedDto, foundComments.foundComments),
		);
	}

	@Version('1')
	@Get(':postid/comments/count')
	async getCommentsCount(@Param('postid', ValidateIdPipe) postId: string): Promise<number> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const commentsCount = await this.commentService.getCommentsCountOfRoot(postId);
		return commentsCount;
	}

	@Version('1')
	@Post(':postid/comments/:commentid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async createReply(
		@Body() body: CreateCommentDto,
		@Req() request: AuthenticatedRequest,
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
	): Promise<ResponseCommentDto> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const createdComment = await this.commentService.createComment({
			...body,
			rootId: postId,
			rootType: SystemEntity.POST,
			targetId: commentId,
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponseCommentDto, createdComment);
	}

	@Version('1')
	@Get(':postid/comments/:commentid/replies')
	@ResponseTransform({ pagination: true })
	async getReplies(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
		@Query() query: GetCommentsDto,
	): Promise<CursorPaginatedData<Populated<ResponseCommentDto>>> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ, { post });
		const foundReplies = await this.commentService.getCommentsOf(commentId, query);
		return new CursorPaginatedData(
			foundReplies.nextCursor,
			plainToInstanceStrict(ResponseCommentDto, foundReplies.foundComments),
		);
	}

	@Version('1')
	@Patch(':postid/comments/:commentid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updateComment(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
		@Body() body: UpdateCommentDto,
	): Promise<ResponseCommentDto> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.UPDATE, { post });
		const updatedComment = await this.commentService.updateComment(commentId, body);
		return plainToInstanceStrict(ResponseCommentDto, updatedComment);
	}

	@Version('1')
	@Delete(':postid/comments/:commentid')
	async deleteComment(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
	): Promise<DeletedCommentsSummary> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.DELETE, { post });
		const deletedComment = await this.commentService.deleteComment(commentId);
		return deletedComment;
	}

	@Version('1')
	@Get(':postid/comments/:commentid/reactions/list')
	@ResponseTransform({ pagination: true })
	async getCommentReactionUsersList(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
		@Query() query: GetReactionUsersDto,
	): Promise<CursorPaginatedData<ResponseReactionUsersDto>> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ, { post });
		const usersListResponse = await this.reactionService.getReactionUsersList(
			commentId,
			query.reactionValue,
			query,
		);
		return new CursorPaginatedData(
			usersListResponse.nextCursor,
			plainToInstanceStrict(ResponseReactionUsersDto, usersListResponse.foundUsers),
		);
	}

	@Version('1')
	@Put(':postid/comments/:commentid/reactions')
	async reactComment(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
		@Req() request: AuthenticatedRequest,
		@Body() body: ReactCommentDto,
	): Promise<ResponseReactionDto> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ, { post });
		const reaction = this.reactionService.upsertReaction(
			{ userId: request.user.id, targetId: commentId, targetType: SystemEntity.COMMENT },
			body.reactionValue,
		);
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}

	@Version('1')
	@Delete(':postid/comments/:commentid/reactions')
	async unreactComment(
		@Param('postid', ValidateIdPipe) postId: string,
		@Param('commentid', ValidateIdPipe) commentId: string,
		@Req() request: AuthenticatedRequest,
	): Promise<ResponseReactionDto> {
		const post = await this.postService.checkAccessTo(postId, Action.READ);
		await this.commentService.checkAccessTo(commentId, Action.READ, { post });
		const reaction = await this.reactionService.delete({
			userId: request.user.id,
			targetId: commentId,
		});
		return plainToInstanceStrict(ResponseReactionDto, reaction);
	}
}
