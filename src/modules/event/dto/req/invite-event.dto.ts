import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';

import { IsValidId } from '@common/decorators/class-validator';

export class InviteEventDto {
	@Expose()
	@IsArray()
	@IsValidId({ each: true })
	toUserIds!: string[];
}
