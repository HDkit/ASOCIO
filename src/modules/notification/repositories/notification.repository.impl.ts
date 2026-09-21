import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateType, Populated, QuerriableType } from '@common/crud/entities';
import { MongooseRepositoryImpl, QueryOptions, SortOptions } from '@common/crud/repos';
import { SortOrder } from '@common/enums';
import { CursorPaginationOption } from '@common/types/data';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { Notification } from '../entities';
import { NotificationCreateInput } from '../types';
import { INotificationRepository } from './notification.repository';

export class NotificationRepositoryImpl
	extends MongooseRepositoryImpl<Notification>
	implements INotificationRepository
{
	constructor(
		@InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
	) {
		super(notificationModel, Notification, { populate: ['actorsIds', 'targetId'] });
	}

	private modifyCreateData(data: NotificationCreateInput): CreateType<Notification> {
		const dataClone = { ...data };
		delete dataClone.actorsIds;
		const update: {
			$addToSet: { actorsIds: Notification['actorsIds'] };
		} = {
			$addToSet: { actorsIds: dataClone.addActorIds ?? [] },
		};
		return { ...dataClone, ...update };
	}

	private getUpsertCondition(data: NotificationCreateInput): QuerriableType<Notification> {
		const upsertConditions = {
			toUserId: data.toUserId,
			targetId: data.targetId,
			targetType: data.targetType,
			notifType: data.notifType,
		};
		return upsertConditions;
	}

	createNotification(
		data: NotificationCreateInput,
		queryOptions?: QueryOptions<Notification>,
	): Promise<Populated<Notification>> {
		const createdNotification = this.upsert(
			this.getUpsertCondition(data),
			this.modifyCreateData(data),
			queryOptions,
		);
		return createdNotification;
	}

	async createNotificationBulk(
		datas: NotificationCreateInput[],
		queryOptions?: QueryOptions<Notification>,
	): Promise<Populated<Notification>[]> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const populateOptions = this.transformPopulate(queryOptions);
		const writeDatas = datas.map(data => [
			this.getUpsertCondition(data),
			this.modifyCreateData(data),
		]);
		const operations = writeDatas.map(data => ({
			updateOne: {
				filter: data[0],
				update: data[1],
				upsert: true,
			},
		}));

		// somehow bulkwrite's session is of type ClientSession | undefined AND NOT | null
		// this is so bullshit
		await this.notificationModel.bulkWrite(operations, { session: session ?? undefined });

		const filterConditions = writeDatas.map(data => data[0]);

		const notifications = this.notificationModel
			.find({ $or: filterConditions })
			.populate(populateOptions)
			.session(session)
			.exec();

		return notifications;
	}

	async getPaginatedNotificationsWithCursorOf(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<Populated<Notification>[]> {
		const filterOptions = {
			toUserId: userId,
			...(options?.cursor && this.transformFilter({ _id: { $gt: options?.cursor } })),
		};
		const sortOptions: SortOptions<Notification> = { updatedAt: SortOrder.DESC };
		const limitOptions = options?.limit || 10;
		const foundNotifications = this.find(filterOptions, {
			customRepoOptions: { sort: sortOptions },
			limit: limitOptions,
		});

		return foundNotifications;
	}
}
