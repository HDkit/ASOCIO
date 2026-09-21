import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { Populated } from '@common/crud/entities';

import { Comment } from '@modules/comment/entities';
import { User } from '@modules/user/entities';

@Exclude()
export class ResponseCommentDto {
	@Expose()
	id!: string;

	@Expose()
	@Type(() => String)
	userId!: string;

	@Expose()
	@Type(() => String)
	targetId!: string;

	@Expose()
	@Type(() => String)
	rootId!: string;

	@Expose()
	rootType!: string;

	@Expose()
	@Transform(({ obj }: { obj: Populated<Comment> }) => {
		const user = obj?.userIdPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	creator!: User;

	@Expose()
	content!: string;

	@Expose()
	fileUrls!: string[] | null;

	@Expose()
	childrenCount!: number;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;
}
