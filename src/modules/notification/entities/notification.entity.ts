import { IBaseEntity } from '@common/crud/entities';
import { SystemEntity } from '@common/enums';

import { NotificationActorType, NotificationType } from '../enums';

export class Notification extends IBaseEntity {
	notifType!: NotificationType;
	toUserId!: string;
	// null in case of system notification
	actorsIds!: string[] | null;
	actorType!: NotificationActorType;
	targetId!: string;
	targetType!: SystemEntity;
	message?: string;
	isRead!: boolean;
}
