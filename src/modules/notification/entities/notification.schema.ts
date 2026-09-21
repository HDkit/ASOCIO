import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import {
	BaseEntitySchemaDef,
	systemEntityToSchema,
	toString,
} from '@common/crud/entities/mongoose-schema';
import { SystemEntity } from '@common/enums';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { NotificationActorType, NotificationType, notificationActorTypeEnumValues } from '../enums';
import { Notification } from './notification.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class NotificationSchemaDef
	extends BaseEntitySchemaDef
	implements Populated<Complete<Notification>>
{
	@Prop({ type: String, enum: NotificationType, required: true })
	notifType!: NotificationType;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: User.name,
		get: toString,
	})
	toUserId!: string;

	@Prop({ type: [mongoose.Schema.Types.ObjectId], required: true, get: toString })
	actorsIds!: string[] | null;

	@Virtual({
		options: {
			ref: (doc: NotificationSchemaDef) => systemEntityToSchema(doc.actorType),
			localField: 'actorsIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	actorsIdsPopulated!: any[] | null;

	@Prop({ type: String, enum: notificationActorTypeEnumValues, required: true, index: true })
	actorType!: NotificationActorType;

	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true, get: toString })
	targetId!: string;

	@Virtual({
		options: {
			ref: (doc: NotificationSchemaDef) => systemEntityToSchema(doc.targetType),
			localField: 'targetId',
			foreignField: '_id',
			justOne: true,
		},
	})
	targetIdPopulated!: any;

	@Prop({ type: String, enum: SystemEntity, required: true })
	targetType!: SystemEntity;

	@Virtual({})
	message!: string;

	@Prop({ type: Boolean, default: false })
	isRead!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationSchemaDef);
export type NotificationDocument = HydratedDocument<Notification>;
