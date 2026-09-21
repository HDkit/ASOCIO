import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ValidatorProps } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';
import { uniqueArrayValidatorForOID } from '@common/validators';

import { User } from '@modules/user/entities';

import { FriendStatus, Friendship } from './friendship.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class FriendshipSchemaDef
	extends BaseEntitySchemaDef
	implements Populated<Complete<Friendship>>
{
	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		ref: User.name,
		required: true,
		index: true,
		validate: [
			{
				validator: (val: string[]) => val.length == 2,
				message: (props: ValidatorProps) =>
					`${props.path} array must have strictly 2 mongo ObjecId`,
			},
			{
				validator: uniqueArrayValidatorForOID,
				message: (props: ValidatorProps) => `${props.path} must only contain unique ids`,
			},
		],
		immutable: true,
		get: toString,
		set: (value: [string, string]) => {
			return value.toSorted();
		},
	})
	userIds!: [string, string];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'userIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	userIdsPopulated!: [any, any];

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, get: toString })
	requestedFrom!: string;

	@Prop({ type: String, enum: FriendStatus, default: FriendStatus.PENDING, required: true })
	status!: FriendStatus;
}

export const FriendshipSchema = SchemaFactory.createForClass(FriendshipSchemaDef);
export type FriendshipDocument = HydratedDocument<Friendship>;

FriendshipSchema.index(
	{ 'userIds.0': 1, 'userIds.1': 1 },
	{ unique: [true, 'Record of friendship between users already existed.'] },
);
