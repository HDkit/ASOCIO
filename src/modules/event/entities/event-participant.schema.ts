import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { EventParticipant, EventParticipantRole } from './event-participant.entity';
import { Event } from './event.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class EventParticipantSchemaDef
	extends BaseEntitySchemaDef
	implements Populated<Complete<EventParticipant>>
{
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: User.name,
		required: true,
		get: toString,
	})
	userId!: string;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'userId',
			foreignField: '_id',
			justOne: true,
		},
	})
	userIdPopulated!: any;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: Event.name,
		required: true,
		get: toString,
	})
	eventId!: string;

	@Prop({ type: String, enum: EventParticipantRole, default: EventParticipantRole.GUEST })
	role!: EventParticipantRole;
}

export const EventParticipantSchema = SchemaFactory.createForClass(EventParticipantSchemaDef);
export type EventParticipantDocument = HydratedDocument<EventParticipant>;
