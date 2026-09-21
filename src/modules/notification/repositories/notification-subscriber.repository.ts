import { IBaseRepository } from '@common/crud/repos';

import { NotificationSubscriber } from '../entities';

export interface INotificationSubscriberRepository
	extends IBaseRepository<NotificationSubscriber> {}

export const INotificationSubscriberRepositoryToken = Symbol('INotificationSubscriberRepository');
