import { Inject, Injectable, MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';

import { Populated } from '@common/crud/entities';
import { SystemEntity } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';
import { SseService } from '@shared/modules/sse/providers/sse.service';

import { ResponseNotificationDto } from '../dto';
import { Notification } from '../entities';
import { NotificationType } from '../enums';
import { NotificationEventPayload, NotificationEvents } from '../events';
import {
	INotificationRepository,
	INotificationRepositoryToken,
	INotificationSubscriberRepository,
	INotificationSubscriberRepositoryToken,
} from '../repositories';
import { NotificationCreateInput } from '../types';

export type PaginatedNotificationsWithCursor = {
	foundNotifications: Populated<Notification>[];
	nextCursor: string;
};

@Injectable()
export class NotificationService {
	constructor(
		@Inject(INotificationRepositoryToken)
		private readonly notificationRepository: INotificationRepository,
		@Inject(INotificationSubscriberRepositoryToken)
		private readonly notificationSubscriberRepository: INotificationSubscriberRepository,
		private readonly sseService: SseService,
	) {}

	private userChannel(uid: string): string {
		return `user.${uid}`;
	}

	/** subscribe user to SSE */
	subscribe(uid: string): Observable<MessageEvent> {
		return this.sseService.subscribe(this.userChannel(uid));
	}

	/** subscribe the current user to a topic so future notifications on it reach them */
	@OnEvent(NotificationEvents.SUBSCRIBE_TOPIC, { suppressErrors: false })
	async subscribeToTopic(
		payload: NotificationEventPayload[typeof NotificationEvents.SUBSCRIBE_TOPIC],
	): Promise<void> {
		const uid = CustomRequestCtx.getAuthenticated().req.user.id;
		await this.notificationSubscriberRepository.create({
			subsciberId: uid,
			topicId: payload.topicId,
		});
	}

	@OnEvent(NotificationEvents.EVENT_INVITE, { suppressErrors: false })
	async createNotificationsOfEventInvitation(
		payload: NotificationEventPayload[typeof NotificationEvents.EVENT_INVITE],
	): Promise<Populated<Notification>[]> {
		return this.alertAll(
			payload.toUserIds.map(toUserId => ({
				actorsIds: [],
				addActorIds: [payload.fromUserId],
				actorType: SystemEntity.USER,
				targetId: payload.event.id,
				targetType: SystemEntity.EVENT,
				toUserId,
				isRead: false,
				notifType: NotificationType.EVENT_INVITE,
			})),
		);
	}

	@OnEvent(NotificationEvents.COMMENTED, { suppressErrors: false })
	async createNotificationsOfComment(
		payload: NotificationEventPayload[typeof NotificationEvents.COMMENTED],
	): Promise<Populated<Notification>[]> {
		const subscriberIds = await this.getSubscribersOf(payload.comment.targetId);
		return this.alertAll(
			subscriberIds
				.filter(id => id != payload.comment.userId)
				.map(id => ({
					actorsIds: [],
					addActorIds: [payload.comment.userId],
					actorType: SystemEntity.USER,
					targetId: payload.comment.targetId,
					targetType:
						payload.comment.targetId == payload.comment.rootId ?
							payload.comment.rootType
						:	SystemEntity.COMMENT,
					toUserId: id,
					isRead: false,
					notifType: NotificationType.COMMENTED,
				})),
		);
	}

	@OnEvent(NotificationEvents.FRIEND_ACCEPTED, { suppressErrors: false })
	async createNotificationsOfFriendAcceptance(
		payload: NotificationEventPayload[typeof NotificationEvents.FRIEND_ACCEPTED],
	): Promise<Populated<Notification>[]> {
		return this.alertAll([
			{
				actorsIds: [],
				addActorIds: [payload.friendship.requestedFrom],
				actorType: SystemEntity.USER,
				targetId: payload.friendship.id,
				targetType: SystemEntity.FRIEND_REQUEST,
				toUserId: payload.friendship.requestedFrom,
				isRead: false,
				notifType: NotificationType.FRIEND_ACCEPTED,
			},
		]);
	}

	@OnEvent(NotificationEvents.FRIEND_REQUEST, { suppressErrors: false })
	async createNotificationsOfFriendRequest(
		payload: NotificationEventPayload[typeof NotificationEvents.FRIEND_REQUEST],
	): Promise<Populated<Notification>[]> {
		return this.alertAll([
			{
				actorsIds: [],
				addActorIds: [payload.friendship.requestedFrom],
				actorType: SystemEntity.USER,
				targetId: payload.friendship.id,
				targetType: SystemEntity.FRIEND_REQUEST,
				toUserId: payload.friendship.userIds.find(id => id != payload.friendship.requestedFrom)!,
				isRead: false,
				notifType: NotificationType.FRIEND_REQUEST,
			},
		]);
	}

	@OnEvent(NotificationEvents.REACTED, { suppressErrors: false })
	async createNotificationsOfReaction(
		payload: NotificationEventPayload[typeof NotificationEvents.REACTED],
	): Promise<Populated<Notification>[]> {
		const subscriberIds = await this.getSubscribersOf(payload.reaction.targetId);
		return this.alertAll(
			subscriberIds
				.filter(id => id != payload.reaction.userId)
				.map(id => ({
					actorsIds: [],
					addActorIds: [payload.reaction.userId],
					actorType: SystemEntity.USER,
					targetId: payload.reaction.targetId,
					targetType: payload.reaction.targetType,
					toUserId: id,
					isRead: false,
					notifType: NotificationType.REACTED,
				})),
		);
	}

	alertNotification(data: Populated<Notification>): boolean {
		return this.sseService.sendToUser(
			this.userChannel(data.toUserId),
			plainToInstanceStrict(ResponseNotificationDto, data),
		);
	}

	private async getSubscribersOf(topicId: string): Promise<string[]> {
		const foundSubscribers = await this.notificationSubscriberRepository.find({ topicId });
		return foundSubscribers.map(subscriber => subscriber.subsciberId);
	}

	private async alertAll(inputs: NotificationCreateInput[]): Promise<Populated<Notification>[]> {
		if (inputs.length === 0) return [];
		const notifications = await this.notificationRepository.createNotificationBulk(inputs);
		notifications.forEach(notification => this.alertNotification(notification));
		return notifications;
	}

	async getNotificationsOf(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<PaginatedNotificationsWithCursor> {
		const foundNotifications =
			await this.notificationRepository.getPaginatedNotificationsWithCursorOf(userId, options);
		const nextCursor = foundNotifications.at(-1)?.id || '';
		return { foundNotifications, nextCursor };
	}

	async readNotification(notificationId: string): Promise<Populated<Notification>> {
		const readNotification = this.notificationRepository.findOneByAndUpdate(
			{ id: notificationId },
			{ isRead: true },
		);
		return readNotification;
	}
}
