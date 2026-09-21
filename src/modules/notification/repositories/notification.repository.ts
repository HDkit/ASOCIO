import { Populated } from '@common/crud/entities';
import { IBaseRepository, QueryOptions } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { Notification } from '../entities';
import { NotificationCreateInput } from '../types';

export interface INotificationRepository extends IBaseRepository<Notification> {
	createNotification(
		data: NotificationCreateInput,
		queryOptions?: QueryOptions<Notification>,
	): Promise<Populated<Notification>>;

	createNotificationBulk(
		data: NotificationCreateInput[],
		queryOptions?: QueryOptions<Notification>,
	): Promise<Populated<Notification>[]>;

	getPaginatedNotificationsWithCursorOf(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Notification>[]>;
}

export const INotificationRepositoryToken = Symbol('INotificationRepository');
