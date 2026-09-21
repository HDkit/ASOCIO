import { SystemEntity } from '@common/enums';

import { Comment } from '@modules/comment/entities';
import { Event } from '@modules/event/entities';
import { Notification } from '@modules/notification/entities';
import { SocialPost } from '@modules/post/entities';
import { Reaction } from '@modules/reaction/entities';
import { Block, Friendship } from '@modules/relationship/entities';
import { User } from '@modules/user/entities';

const entityToSchemaMap: Record<SystemEntity, string> = {
	[SystemEntity.BLOCK]: Block.name,
	[SystemEntity.COMMENT]: Comment.name,
	[SystemEntity.EVENT]: Event.name,
	[SystemEntity.FRIEND_REQUEST]: Friendship.name,
	[SystemEntity.NOTIFICATION]: Notification.name,
	[SystemEntity.POST]: SocialPost.name,
	[SystemEntity.REACTION]: Reaction.name,
	[SystemEntity.USER]: User.name,
};

export const systemEntityToSchema = (entity: SystemEntity): string => {
	return entityToSchemaMap[entity];
};
