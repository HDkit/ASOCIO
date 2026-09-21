import { Schema, Virtual } from '@nestjs/mongoose';

import { Complete } from '@common/types/utils';

import { IBaseEntity } from '../base-entity.type';
import { Populated } from '../querry-type';

@Schema()
export class BaseEntitySchemaDef implements Populated<Complete<IBaseEntity>> {
	_id!: string;
	@Virtual({
		get: function (this: BaseEntitySchemaDef) {
			return this._id.toString();
		},
	})
	id!: string;

	createdAt!: Date;
	updatedAt!: Date;
}
