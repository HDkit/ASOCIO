import { IBaseEntity } from '@common/crud/entities';
import { SystemEntity } from '@common/enums';

export const reactionTargetTypeEnumValues = [SystemEntity.POST, SystemEntity.COMMENT] as const;
export type ReactionTargetType = (typeof reactionTargetTypeEnumValues)[number];

export class Reaction extends IBaseEntity {
	userId!: string;
	targetId!: string;
	targetType!: ReactionTargetType;

	// representing the emoji
	reactionValue!: number;
}
