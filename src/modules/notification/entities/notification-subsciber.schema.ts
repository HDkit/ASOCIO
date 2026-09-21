import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { NotificationSubscriber } from './notification-subscriber.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class NotificationSubscriberSchemaDef
	extends BaseEntitySchemaDef
	implements Populated<Complete<NotificationSubscriber>>
{
	@Prop({ type: mongoose.Schema.ObjectId, required: true, get: toString })
	subsciberId!: string;

	@Prop({ type: mongoose.Schema.ObjectId, required: true, get: toString })
	topicId!: string;
}

export const NotificationSubscriberSchema = SchemaFactory.createForClass(
	NotificationSubscriberSchemaDef,
);
export type NotificationSubscriberDocument = HydratedDocument<Notification>;
