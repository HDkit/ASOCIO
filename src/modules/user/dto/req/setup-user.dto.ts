import { Expose, Transform, Type } from 'class-transformer';
import {
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsDefined,
	IsEnum,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { str2bool } from '@common/utils';

import { Location, Sport } from '@modules/user/entities';
import { Level } from '@modules/user/enums';

export class LocationDto implements Location {
	@Expose()
	@IsString()
	province!: string;

	@Expose()
	@IsString()
	city!: string;

	@Expose()
	@Transform(({ value }) => (typeof value === 'string' ? str2bool(value) : (value as boolean)))
	@IsBoolean()
	hidden!: boolean;
}

export class SportDto implements Sport {
	@Expose()
	@IsEnum(Level)
	level!: Level;

	@Expose()
	@IsNotEmpty()
	@IsString()
	name!: string;
}

export class SetupUserDto {
	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'webp'])
	@HasMimeType(['image/*'])
	@IsDefined()
	@IsFile()
	avatar!: MemoryStoredFile;

	@Expose()
	@Type(() => LocationDto)
	@IsNotEmpty()
	@ValidateNested()
	location!: LocationDto;

	@Expose()
	@Transform(({ value }) => {
		if (value === '[]') return [];
		return value as [];
	})
	@Type(() => SportDto)
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayUnique((dto: SportDto) => dto.name, {
		message: "sport's names must be unique",
	})
	sports!: SportDto[];
}
