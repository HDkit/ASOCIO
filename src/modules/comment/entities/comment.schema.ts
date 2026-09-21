import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Comment, CommentRootType, commentRootTypeEnumValues } from './comment.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class CommentSchemaDef extends BaseEntitySchemaDef implements Populated<Complete<Comment>> {
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

	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true, get: toString })
	rootId!: string;

	@Prop({ type: String, enum: commentRootTypeEnumValues, required: true, index: true })
	rootType!: CommentRootType;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true, get: toString })
	targetId!: string;

	@Prop({ type: [String], default: null })
	fileUrls!: string[] | null;

	@Virtual({
		options: {
			ref: Comment.name,
			localField: '_id',
			foreignField: 'targetId',
			count: true,
			getters: true,
		},
	})
	childrenCount!: number;

	@Prop({ type: String, required: true })
	content!: string;
}

export const CommentSchema = SchemaFactory.createForClass(CommentSchemaDef);
export type CommentDocument = HydratedDocument<Comment>;

CommentSchema.index({ createdAt: 1 });
CommentSchema.index({ updatedAt: 1 });
CommentSchema.index({ rootId: 1, rootType: 1 });
