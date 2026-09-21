import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongooseRepositoryImpl } from '@common/crud/repos';

import { NotificationSubscriber } from '../entities';
import { INotificationSubscriberRepository } from './notification-subscriber.repository';

export class NotificationSubscriberRepositoryImpl
	extends MongooseRepositoryImpl<NotificationSubscriber>
	implements INotificationSubscriberRepository
{
	constructor(
		@InjectModel(NotificationSubscriber.name) notificationModel: Model<NotificationSubscriber>,
	) {
		super(notificationModel, NotificationSubscriber);
	}
}
