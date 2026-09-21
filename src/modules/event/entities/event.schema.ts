import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { SoftDeletableEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Event } from './event.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class EventSchemaDef
	extends SoftDeletableEntitySchemaDef
	implements Populated<Complete<Event>>
{
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: User.name,
		required: true,
		get: toString,
	})
	createdBy!: string;

	@Prop({ type: [String], index: true, default: [] })
	keyword!: string[];

	@Prop({ type: String, default: null })
	coverUrl!: string;

	@Prop({ type: String, index: 'text', required: true })
	name!: string;

	@Prop({ type: String, index: 'text', default: '' })
	description!: string;

	@Prop({ type: Date, required: true })
	startAt!: Date;

	@Prop({ type: Date, required: true })
	endAt!: Date;

	@Prop({ type: String, required: true })
	location!: string;

	@Prop({ type: Boolean, default: true })
	isPrivate!: boolean;

	@Prop({ type: Boolean, default: false })
	allowInvite!: boolean;

	@Prop({ type: Boolean, default: false })
	isCanceled!: boolean;
}

export const EventSchema = SchemaFactory.createForClass(EventSchemaDef);
export type EventDocument = HydratedDocument<Event>;
