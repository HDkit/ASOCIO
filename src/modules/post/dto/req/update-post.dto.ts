import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Max, Min } from 'class-validator';

import { MAX_FILES_NUM } from '@common/constants';
import { ConcreteClass } from '@common/types/utils';

import {
	CreateEventPostDto,
	CreateFilePostDto,
	CreatePostDto,
	CreateSharePostDto,
} from './create-post.dto';

function UpdatePostDto<T extends CreatePostDto>(CreatePostDto: ConcreteClass<T>) {
	return IntersectionType(
		PartialType(OmitType(CreatePostDto, ['postType'])),
		PickType(CreatePostDto, ['postType']),
	);
}

export class UpdateFilePostDto extends UpdatePostDto(CreateFilePostDto) {
	/** Index of file urls that needs to be removed */
	@Expose()
	@Type(() => Number)
	@IsArray()
	@IsInt({ each: true })
	@IsOptional()
	@Max(MAX_FILES_NUM, { each: true })
	@Min(0, { each: true })
	deletedFilesIdx?: number[];
}
export class UpdateSharePostDto extends OmitType(UpdatePostDto(CreateSharePostDto), [
	'parentPostId',
]) {}
export class UpdateEventPostDto extends OmitType(UpdatePostDto(CreateEventPostDto), ['eventId']) {}
