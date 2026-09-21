import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Block } from './block.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class BlockSchemaDef extends BaseEntitySchemaDef implements Populated<Complete<Block>> {
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: User.name,
		required: true,
		get: toString,
	})
	fromUserId!: string;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'fromUserId',
			foreignField: '_id',
			justOne: true,
		},
	})
	fromUserIdPopulated!: any;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: User.name,
		required: true,
		get: toString,
	})
	toUserId!: string;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'toUserId',
			foreignField: '_id',
			justOne: true,
		},
	})
	toUserIdPopulated!: any;
}

export const BlockSchema = SchemaFactory.createForClass(BlockSchemaDef);
export type BlockDocument = HydratedDocument<Block>;
