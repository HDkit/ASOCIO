import { IBaseEntity } from '@common/crud/entities';
import { SystemEntity } from '@common/enums';

export const commentRootTypeEnumValues = [SystemEntity.POST] as const;
export type CommentRootType = (typeof commentRootTypeEnumValues)[number];

export class Comment extends IBaseEntity {
	userId!: string;

	rootId!: string;
	rootType!: CommentRootType;
	targetId!: string;

	content!: string;
	fileUrls!: string[] | null;

	// virtual fields
	childrenCount?: number;
}
