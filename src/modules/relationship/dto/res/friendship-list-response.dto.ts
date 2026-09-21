import { Exclude, Expose, Type } from 'class-transformer';

import { MoreLimitedUserResponseDto } from '@modules/user/dto';
import { User } from '@modules/user/entities';

@Exclude()
export class ResponseFriendshipListDto {
	@Expose({ name: 'userIdsPopulated' })
	@Type(() => MoreLimitedUserResponseDto(['id', 'username', 'avatarUrl']))
	user!: User;

	@Expose()
	id!: string;
}
