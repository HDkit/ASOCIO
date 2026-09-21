import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { str2bool } from '@common/utils';

export class CreateEventDto {
	@Expose()
	@Transform(({ value }) => {
		if (value === '[]') return [];
		return value as [];
	})
	@IsArray()
	@IsString({ each: true })
	keyword!: string[];

	@Expose()
	@IsString()
	name!: string;

	@Expose()
	@IsString()
	description!: string;

	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'webp'])
	@HasMimeType(['image/*'])
	@IsFile()
	@IsOptional()
	cover?: MemoryStoredFile;

	@Expose()
	@Type(() => Date)
	@IsDate()
	startAt!: Date;

	@Expose()
	@Type(() => Date)
	@IsDate()
	endAt!: Date;

	@Expose()
	@IsString()
	location!: string;

	@Expose()
	@Transform(({ value }) => (typeof value === 'string' ? str2bool(value) : (value as boolean)))
	@IsBoolean()
	isPrivate!: boolean;

	@Expose()
	@Transform(({ value }) => (typeof value === 'string' ? str2bool(value) : (value as boolean)))
	@IsBoolean()
	allowInvite!: boolean;
}
