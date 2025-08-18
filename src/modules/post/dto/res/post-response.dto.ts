import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { Populated } from '@common/crud/entities';
import { VisibilityLevel } from '@common/enums';

import { PostType } from '@modules/post/enums';
import { User } from '@modules/user/entities';

import { SocialPost } from '../../entities';

@Exclude()
export class ResponsePostDto {
	@Expose()
	id!: string;

	@Expose()
	postType!: PostType;

	@Expose()
	visibility!: VisibilityLevel;

	@Expose()
	content!: string;

	@Expose()
	fileUrls!: string[] | null;

	@Expose()
	embeddedEventId!: any;

	@Expose()
	parentPostId!: any;

	@Expose()
	@Type(() => String)
	userId!: string;

	@Expose()
	@Transform(({ obj }: { obj: Populated<SocialPost> }) => {
		const user = obj?.userIdPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	creator!: User;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;

	@Expose()
	deleted!: boolean;

	@Expose()
	deletedAt!: Date | null;

	@Expose()
	deletedBy!: string | null;

	@Expose()
	sharedCount!: number;

	@Expose()
	@Transform(({ obj }: { obj: Populated<SocialPost> }) => {
		const user = obj?.deletedByPopulated as User | null;
		if (!user) return null;
		return {
			username: user.username,
			avatarUrl: user.avatarUrl,
		};
	})
	deletedByUser!: Partial<Pick<User, 'username' | 'avatarUrl'>> | null;

	// ignore
	@Expose()
	@Type(() => String)
	visibleToCommunityId!: string | null;

	@Expose()
	@Type(() => String)
	visibleToUsersIds!: string[];

	@Expose()
	@Type(() => String)
	invisibleToUsersIds!: string[];
}
