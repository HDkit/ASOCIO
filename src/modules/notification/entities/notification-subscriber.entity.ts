import { IBaseEntity } from '@common/crud/entities';

export class NotificationSubscriber extends IBaseEntity {
	subsciberId!: string;
	topicId!: string;
}
