import { Exclude, Expose, Type } from 'class-transformer';

import { MoreLimitedUserResponseDto } from '@modules/user/dto';
import { User } from '@modules/user/entities';

@Exclude()
export class ResponseBlockDto {
	@Expose({ name: 'fromUserIdPopulated' })
	@Type(() => MoreLimitedUserResponseDto(['id', 'username', 'avatarUrl']))
	fromUser!: User;

	@Expose({ name: 'toUserIdPopulated' })
	@Type(() => MoreLimitedUserResponseDto(['id', 'username', 'avatarUrl']))
	toUser!: User;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;
}
