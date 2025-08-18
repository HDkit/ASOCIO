import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { SoftDeletableEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { VisibilityLevel } from '@common/enums';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { PostType } from '../enums';
import { SocialPost } from './social-post.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class SocialPostSchemaDef
	extends SoftDeletableEntitySchemaDef
	implements Populated<Complete<SocialPost>>
{
	@Prop({ type: String, enum: VisibilityLevel, required: true, index: true })
	visibility!: VisibilityLevel;

	@Prop({ type: String, index: 'text', default: null })
	content!: string;

	@Prop({ type: [String], default: null })
	fileUrls!: string[] | null;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Event.name,
		default: null,
		immutable: true,
		get: toString,
	})
	embeddedEventId!: string | null;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: SocialPost.name,
		default: null,
		immutable: true,
		get: toString,
	})
	parentPostId!: string | null;

	@Virtual({
		options: {
			ref: SocialPost.name,
			localField: 'parentPostId',
			foreignField: '_id',
			justOne: true,
		},
	})
	parentPostIdPopulated!: any;

	@Prop({ type: String, enum: PostType, required: true, default: PostType.FILES, immutable: true })
	postType!: PostType;

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

	// [PLAN] not implemented
	@Prop({ type: [mongoose.Schema.Types.ObjectId], default: null, ref: 'Group', get: toString })
	visibleToCommunityId!: string | null;

	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		default: null,
		ref: User.name,
		index: true,
		get: toString,
	})
	visibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'visibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	visibleToUsersIdsPopulated!: any[];

	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		default: null,
		ref: User.name,
		index: true,
		get: toString,
	})
	invisibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'invisibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	invisibleToUsersIdsPopulated!: any[];

	@Virtual({
		options: {
			ref: SocialPost.name,
			localField: '_id',
			foreignField: 'parentPostId',
			count: true,
			getters: true,
		},
	})
	sharedCount!: number;
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPostSchemaDef);
export type SocialPostDocument = HydratedDocument<SocialPost>;

SocialPostSchema.index({ createdAt: 1 });
SocialPostSchema.index({ updatedAt: 1 });
