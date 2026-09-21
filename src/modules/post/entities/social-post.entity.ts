import { ISoftDeletableEntity } from '@common/crud/entities';
import { VisibilityLevel } from '@common/enums';

import { PostType } from '../enums';

export class SocialPost extends ISoftDeletableEntity {
	visibility!: VisibilityLevel;
	content!: string | null;

	userId!: string;
	// if there's event, file is set to null
	// PostType.FILES
	fileUrls!: string[] | null;
	// PostType.EVENT
	embeddedEventId!: string | null;
	// PostType.SHARED
	parentPostId!: string | null;
	postType!: PostType;
	// ignore
	visibleToCommunityId!: string | null;
	visibleToUsersIds!: string[];
	invisibleToUsersIds!: string[];
	sharedCount?: number;
}
