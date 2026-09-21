import { CreateType } from '@common/crud/entities';

import { Notification } from '../entities';

export type NotificationCreateInput = CreateType<Notification> & {
	addActorIds?: Notification['actorsIds'];
	removeActorIds?: Notification['actorsIds'];
};
