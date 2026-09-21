import { Exclude, Expose, Type } from 'class-transformer';

import { MoreLimitedUserResponseDto } from '@modules/user/dto';
import { User } from '@modules/user/entities';

@Exclude()
export class ResponseBlockListDto {
	@Expose({ name: 'toUserIdPopulated' })
	@Type(() => MoreLimitedUserResponseDto(['id', 'username', 'avatarUrl']))
	toUser!: User;
}
