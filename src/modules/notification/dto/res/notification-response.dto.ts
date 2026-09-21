import { Exclude, Expose, Type } from 'class-transformer';

import { SystemEntity } from '@common/enums';

import { NotificationType } from '@modules/notification/enums';
import { LimitedUserResponseDto } from '@modules/user/dto';

@Exclude()
export class ResponseNotificationDto {
	@Expose()
	id!: string;

	@Expose()
	notifType!: NotificationType;

	@Expose()
	toUserId!: string;

	@Expose({ name: 'actorsIdsPopulated' })
	@Type(() => LimitedUserResponseDto)
	actors!: LimitedUserResponseDto[];

	@Expose()
	targetType!: SystemEntity;

	@Expose()
	targetId!: string;

	@Expose()
	message!: string;

	@Expose()
	isRead!: boolean;
}
