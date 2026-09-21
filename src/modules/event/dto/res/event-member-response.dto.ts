import { Exclude, Expose, Type } from 'class-transformer';

import { EventParticipantRole } from '@modules/event/entities';
import { LimitedUserResponseDto } from '@modules/user/dto';

@Exclude()
export class ResponseEventMemberDto {
	@Expose({ name: 'userIdPopulated' })
	@Type(() => LimitedUserResponseDto)
	user!: LimitedUserResponseDto;

	@Expose()
	role!: EventParticipantRole;
}
