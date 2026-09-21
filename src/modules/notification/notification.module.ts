import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SseModule } from '@shared/modules/sse/sse.module';

import { NotificationController } from './controllers/notification.controller';
import {
	Notification,
	NotificationSchema,
	NotificationSubscriber,
	NotificationSubscriberSchema,
} from './entities';
import { NotificationService } from './providers/notification.service';
import {
	INotificationRepositoryToken,
	INotificationSubscriberRepositoryToken,
	NotificationRepositoryImpl,
	NotificationSubscriberRepositoryImpl,
} from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Notification.name,
				schema: NotificationSchema,
			},
			{
				name: NotificationSubscriber.name,
				schema: NotificationSubscriberSchema,
			},
		]),
		SseModule,
	],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{
			provide: INotificationRepositoryToken,
			useClass: NotificationRepositoryImpl,
		},
		{
			provide: INotificationSubscriberRepositoryToken,
			useClass: NotificationSubscriberRepositoryImpl,
		},
	],
	exports: [NotificationService],
})
export class NotificationModule {}
