import { Inject, Injectable, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';

import { Populated } from '@common/crud/entities';
import { SystemEntity } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { Comment } from '@modules/comment/entities';
import { Event } from '@modules/event/entities';
import { Reaction } from '@modules/reaction/entities';
import { Friendship } from '@modules/relationship/entities';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';
import { SseService } from '@shared/modules/sse/providers/sse.service';

import { ResponseNotificationDto } from '../dto';
import { Notification } from '../entities';
import { NotificationType } from '../enums';
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

type NotificationCreationMap = {
	[NotificationType.EVENT_INVITE]: (
		event: Event,
		fromUserId: string,
		toUserIds: string[],
	) => Promise<Populated<Notification>[]>;
	[NotificationType.COMMENTED]: (comment: Comment) => Promise<Populated<Notification>[]>;
	[NotificationType.FRIEND_ACCEPTED]: (
		friendship: Friendship,
	) => Promise<Populated<Notification>[]>;
	[NotificationType.FRIEND_REQUEST]: (friendship: Friendship) => Promise<Populated<Notification>[]>;
	[NotificationType.REACTED]: (reaction: Reaction) => Promise<Populated<Notification>[]>;
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

	private createNotifcationOnEventInvitation = async (
		event: Event,
		fromUserId: string,
		toUserIds: string[],
	): Promise<Populated<Notification>[]> => {
		const notifications: NotificationCreateInput[] = toUserIds.map(id => ({
			actorsIds: [],
			addActorIds: [fromUserId],
			actorType: SystemEntity.USER,
			targetId: event.id,
			targetType: SystemEntity.EVENT,
			toUserId: id,
			isRead: false,
			notifType: NotificationType.EVENT_INVITE,
		}));
		const createdNotifications =
			await this.notificationRepository.createNotificationBulk(notifications);
		return createdNotifications;
	};

	private createNotificationOnComment = async (
		comment: Comment,
	): Promise<Populated<Notification>[]> => {
		const subsciberIds = await this.getSubsscribersOf(comment.targetId);
		const notifications: NotificationCreateInput[] = subsciberIds
			.filter(id => id != comment.userId)
			.map(id => ({
				actorsIds: [],
				addActorIds: [comment.userId],
				actorType: SystemEntity.USER,
				targetId: comment.targetId,
				targetType: comment.targetId == comment.rootId ? comment.rootType : SystemEntity.COMMENT,
				toUserId: id,
				isRead: false,
				notifType: NotificationType.COMMENTED,
			}));
		const createdNotifications =
			await this.notificationRepository.createNotificationBulk(notifications);
		return createdNotifications;
	};

	private createNotificationOnFriendAcceptance = async (
		friendship: Friendship,
	): Promise<Populated<Notification>[]> => {
		const notification = await this.notificationRepository.createNotification({
			actorsIds: [],
			addActorIds: [friendship.requestedFrom],
			actorType: SystemEntity.USER,
			targetId: friendship.id,
			targetType: SystemEntity.FRIEND_REQUEST,
			toUserId: friendship.requestedFrom,
			isRead: false,
			notifType: NotificationType.FRIEND_ACCEPTED,
		});
		return [notification];
	};

	private createNotificationOnFriendRequest = async (
		friendship: Friendship,
	): Promise<Populated<Notification>[]> => {
		const notification = await this.notificationRepository.createNotification({
			actorsIds: [],
			addActorIds: [friendship.requestedFrom],
			actorType: SystemEntity.USER,
			targetId: friendship.id,
			targetType: SystemEntity.FRIEND_REQUEST,
			toUserId: friendship.userIds.find(id => id != friendship.requestedFrom)!,
			isRead: false,
			notifType: NotificationType.FRIEND_REQUEST,
		});
		return [notification];
	};

	private createNotificationOnReaction = async (
		reaction: Reaction,
	): Promise<Populated<Notification>[]> => {
		const subsciberIds = await this.getSubsscribersOf(reaction.targetId);
		const notifications: NotificationCreateInput[] = subsciberIds
			.filter(id => id != reaction.userId)
			.map(id => ({
				actorsIds: [],
				addActorIds: [reaction.userId],
				actorType: SystemEntity.USER,
				targetId: reaction.targetId,
				targetType: reaction.targetType,
				toUserId: id,
				isRead: false,
				notifType: NotificationType.REACTED,
			}));
		const createdNotifications =
			await this.notificationRepository.createNotificationBulk(notifications);
		return createdNotifications;
	};

	private notificationCreationMap: NotificationCreationMap = {
		[NotificationType.EVENT_INVITE]: this.createNotifcationOnEventInvitation,
		[NotificationType.COMMENTED]: this.createNotificationOnComment,
		[NotificationType.FRIEND_ACCEPTED]: this.createNotificationOnFriendAcceptance,
		[NotificationType.FRIEND_REQUEST]: this.createNotificationOnFriendRequest,
		[NotificationType.REACTED]: this.createNotificationOnReaction,
	};

	private userChannel(uid: string) {
		return `user.${uid}`;
	}

	/** subscribe user to SSE */
	subscribe(uid: string): Observable<MessageEvent> {
		return this.sseService.subscribe(this.userChannel(uid));
	}

	/** subscribe user to a topic, saves on DB */
	async subscribeToTopic(topicId: string): Promise<void> {
		const uid = CustomRequestCtx.getAuthenticated().req.user.id;
		await this.notificationSubscriberRepository.create({ subsciberId: uid, topicId });
	}

	alertNotification(data: Populated<Notification>) {
		return this.sseService.sendToUser(
			this.userChannel(data.toUserId),
			plainToInstanceStrict(ResponseNotificationDto, data),
		);
	}

	private async getSubsscribersOf(topicId: string): Promise<string[]> {
		const foundSubscribers = await this.notificationSubscriberRepository.find({ topicId });
		const foundSubscribersIds = foundSubscribers.map(subscriber => subscriber.subsciberId);
		return foundSubscribersIds;
	}

	async createAndSendNotification<T extends NotificationType>(
		type: T,
		...values: Parameters<(typeof this.notificationCreationMap)[T]>
	): Promise<Populated<Notification>[]> {
		//@ts-expect-error: unexpected error spreading union of tuples
		const notifications = await this.notificationCreationMap[type](...values);
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
		return { foundNotifications: foundNotifications, nextCursor };
	}

	async readNotification(notificationId: string): Promise<Populated<Notification>> {
		const readNotification = this.notificationRepository.findOneByAndUpdate(
			{ id: notificationId },
			{ isRead: true },
		);
		return readNotification;
	}
}
