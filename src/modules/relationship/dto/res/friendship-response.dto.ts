import { Exclude, Expose, Type } from 'class-transformer';

import { FriendStatus } from '@modules/relationship/entities';
import { MoreLimitedUserResponseDto } from '@modules/user/dto';
import { User } from '@modules/user/entities';

@Exclude()
export class ResponseFriendshipDto {
	@Expose()
	id!: string;

	@Expose({ name: 'userIdsPopulated' })
	@Type(() => MoreLimitedUserResponseDto(['id', 'username', 'avatarUrl']))
	withUser!: User;

	@Expose()
	status!: FriendStatus;
}
