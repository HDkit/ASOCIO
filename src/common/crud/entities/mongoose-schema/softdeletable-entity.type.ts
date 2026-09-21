import { Prop, Schema, Virtual } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Complete } from '@common/types/utils';

// import { User } from '@modules/user/entities';

import { Populated } from '../querry-type';
import { ISoftDeletableEntity } from '../softdeletable-entity.type';
import { BaseEntitySchemaDef } from './base-entity.schema';
import { toString } from './oid-to-string';

@Schema()
export class SoftDeletableEntitySchemaDef
	extends BaseEntitySchemaDef
	implements Populated<Complete<ISoftDeletableEntity>>
{
	@Prop({ type: Boolean, default: false, index: true })
	deleted!: boolean;

	@Prop({ type: Date, default: null })
	deletedAt!: Date | null;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		default: null,
		index: true,
		ref: 'User',
		get: toString,
	})
	deletedBy!: string | null;

	@Virtual({
		options: {
			ref: 'User',
			localField: 'deletedBy',
			foreignField: '_id',
			justOne: true,
		},
	})
	deletedByPopulated!: any;
}
