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
import { Action, Role } from '@common/enums';
import { UnionValidationPipe, ValidateIdPipe } from '@common/pipes';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import {
	CreateEventPostDto,
	CreateFilePostDto,
	CreateSharePostDto,
	FeedPostDto,
	ResponsePostDto,
	SharePostDto,
	UpdateEventPostDto,
	UpdateFilePostDto,
	UpdateSharePostDto,
} from '../dto';
import { PostType } from '../enums';
import { PostService } from '../providers';

@PriorityRole(Role.USER)
@Controller()
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Version('1')
	@Post()
	@FormDataRequest({ storage: MemoryStoredFile })
	async createPost(
		@Req() request: AuthenticatedRequest,
		@Body(
			new UnionValidationPipe<UpdateEventPostDto | UpdateFilePostDto | UpdateSharePostDto>({
				discriminator: 'postType',
				defaultDiscriminatorValue: PostType.FILES,
				types: {
					[PostType.EVENT]: CreateEventPostDto,
					[PostType.FILES]: CreateFilePostDto,
					[PostType.SHARED]: CreateSharePostDto,
				},
			}),
		)
		body: CreateEventPostDto | CreateFilePostDto | CreateSharePostDto,
	): Promise<Populated<ResponsePostDto>> {
		const createdPost = await this.postService.createPost({ ...body, userId: request.user.id });
		return plainToInstanceStrict(ResponsePostDto, createdPost);
	}

	@Version('1')
	@Delete(':postid')
	async deletePost(
		@Param('postid', ValidateIdPipe) postId: string,
	): Promise<Populated<ResponsePostDto>> {
		await this.postService.checkAccessTo(postId, Action.DELETE);
		const deletedPost = await this.postService.deletePost(postId);
		return plainToInstanceStrict(ResponsePostDto, deletedPost);
	}

	@Version('1')
	@Patch(':postid')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updatePost(
		@Param('postid', ValidateIdPipe) postId: string,
		@Body(
			new UnionValidationPipe<UpdateEventPostDto | UpdateFilePostDto | UpdateSharePostDto>({
				discriminator: 'postType',
				types: {
					[PostType.EVENT]: UpdateEventPostDto,
					[PostType.FILES]: UpdateFilePostDto,
					[PostType.SHARED]: UpdateSharePostDto,
				},
			}),
		)
		body: UpdateEventPostDto | UpdateFilePostDto | UpdateSharePostDto,
	): Promise<Populated<ResponsePostDto>> {
		await this.postService.checkAccessTo(postId, Action.UPDATE);
		const updatedPost = await this.postService.updatePost(postId, body.postType, body);
		return plainToInstanceStrict(ResponsePostDto, updatedPost);
	}

	@Version('1')
	@Get('feed')
	@ResponseTransform({ pagination: true })
	async getFeed(
		@Req() request: AuthenticatedRequest,
		@Query() query: FeedPostDto,
	): Promise<CursorPaginatedData<Populated<ResponsePostDto>>> {
		const feedPosts = await this.postService.getFeeds(request.user.id, query);
		return new CursorPaginatedData(
			feedPosts.nextCursor,
			plainToInstanceStrict(ResponsePostDto, feedPosts.foundPosts),
		);
	}

	@Version('1')
	@Get(':postid')
	async getPost(
		@Param('postid', ValidateIdPipe) postId: string,
	): Promise<Populated<ResponsePostDto>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const foundPost = await this.postService.getPost(postId);
		return plainToInstanceStrict(ResponsePostDto, foundPost);
	}

	@Version('1')
	@Post(':postid/share')
	async sharePost(
		@Param('postid', ValidateIdPipe) postId: string,
		@Req() request: AuthenticatedRequest,
		@Body() body: SharePostDto,
	): Promise<Populated<ResponsePostDto>> {
		await this.postService.checkAccessTo(postId, Action.READ);
		const createdPost = await this.postService.createPost({
			...body,
			parentPostId: postId,
			userId: request.user.id,
		});
		return plainToInstanceStrict(ResponsePostDto, createdPost);
	}
}
