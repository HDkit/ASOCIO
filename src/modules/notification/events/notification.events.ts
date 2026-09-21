import { EventEmitter2 } from '@nestjs/event-emitter';

import type { Comment } from '@modules/comment/entities';
import type { Event } from '@modules/event/entities';
import type { Reaction } from '@modules/reaction/entities';
import type { Friendship } from '@modules/relationship/entities';

export const NotificationEvents = {
	EVENT_INVITE: 'notification.event-invite',
	COMMENTED: 'notification.commented',
	FRIEND_ACCEPTED: 'notification.friend-accepted',
	FRIEND_REQUEST: 'notification.friend-request',
	REACTED: 'notification.reacted',
	SUBSCRIBE_TOPIC: 'notification.subscribe-topic',
} as const;

export type NotificationEventName = (typeof NotificationEvents)[keyof typeof NotificationEvents];

export type NotificationEventPayload = {
	[NotificationEvents.EVENT_INVITE]: {
		event: Event;
		fromUserId: string;
		toUserIds: string[];
	};
	[NotificationEvents.COMMENTED]: { comment: Comment };
	[NotificationEvents.FRIEND_ACCEPTED]: { friendship: Friendship };
	[NotificationEvents.FRIEND_REQUEST]: { friendship: Friendship };
	[NotificationEvents.REACTED]: { reaction: Reaction };
	[NotificationEvents.SUBSCRIBE_TOPIC]: { topicId: string };
};

export async function emitNotificationEvent<K extends NotificationEventName>(
	eventEmitter: EventEmitter2,
	event: K,
	payload: NotificationEventPayload[K],
): Promise<boolean> {
	const results = await (eventEmitter.emitAsync(event, payload) as Promise<unknown[] | false>);
	return Array.isArray(results) && results.length > 0;
}
