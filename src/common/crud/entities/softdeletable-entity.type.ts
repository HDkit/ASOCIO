import { IBaseEntity } from './base-entity.type';

export abstract class ISoftDeletableEntity extends IBaseEntity {
	deleted!: boolean;
	deletedBy!: string | null;
	deletedAt!: Date | null;
}
