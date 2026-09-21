import { Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { EventParticipantRole } from '@modules/event/entities';

export class UpdateEventMemberDto {
	@Expose()
	@IsEnum(EventParticipantRole)
	@IsOptional()
	role?: EventParticipantRole;
}
