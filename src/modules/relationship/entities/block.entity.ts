import { IBaseEntity } from '@common/crud/entities';

export class Block extends IBaseEntity {
	fromUserId!: string;
	toUserId!: string;
}
