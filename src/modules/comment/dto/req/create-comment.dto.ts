import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HasExtension, HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CreateCommentDto {
	@Expose()
	@IsNotEmpty()
	@IsString()
	content!: string;

	@Expose()
	@Type(() => MemoryStoredFile)
	@HasExtension(['png', 'jpg', 'jpeg', 'gif', 'ogg', 'mp4', 'webp'], { each: true })
	@HasMimeType(['image/*', 'video/*'], { each: true })
	@IsArray()
	@IsFile({ each: true })
	@IsOptional()
	files!: MemoryStoredFile[];
}
