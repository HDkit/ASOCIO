import {
	AbilityBuilder,
	ExtractSubjectType,
	ForcedSubject,
	InferSubjects,
	MongoAbility,
	createMongoAbility,
	subject,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

import { Action, Role, SystemEntity, VisibilityLevel } from '@common/enums';

import { Sub } from '@modules/auth/types';
import { Comment } from '@modules/comment/entities';
import { SocialPost } from '@modules/post/entities';
import { User } from '@modules/user/entities';

export const subjectTypeMap = {
	User,
	SocialPost,
	Comment,
};

type Subjects = InferSubjects<typeof User | typeof SocialPost | typeof Comment> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

export type UserAbilityOptions = {
	post?: SocialPost;
};

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: Sub, options?: UserAbilityOptions) {
		const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
		if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.MODERATOR)) {
			can(Action.MANAGE, User);
			can(Action.MANAGE, SocialPost);
			can(Action.MANAGE, Comment);
		} else {
			// user on USERS
			{
				cannot(Action.CREATE, User);
				can(Action.READ, User);
				can([Action.UPDATE, Action.DELETE], User, {
					id: new mongoose.Types.ObjectId(user.id) as unknown as string,
				});
			}
			// user on SOCIAL POSTS
			{
				// can manage own post
				can(Action.MANAGE, SocialPost, {
					userId: new mongoose.Types.ObjectId(user.id) as unknown as string,
				});
				// can create post
				can(Action.CREATE, SocialPost);
				// privacy for read
				can(Action.READ, SocialPost, { visibility: VisibilityLevel.PUBLIC });
				can(Action.READ, SocialPost, {
					visibility: VisibilityLevel.LIMITED,
					visibleToUsersIds: {
						$in: [new mongoose.Types.ObjectId(user.id) as unknown as string],
					},
				});
				// cannot update, delete others' post
				cannot([Action.UPDATE, Action.DELETE], SocialPost, {
					userId: { $ne: new mongoose.Types.ObjectId(user.id) as unknown as string },
				});
				// cant interact with deleted post
				cannot(Action.MANAGE, SocialPost, { deleted: true });
			}
			// user on COMMENTS
			{
				// can manage own comment
				can(Action.MANAGE, Comment, {
					userId: new mongoose.Types.ObjectId(user.id) as unknown as string,
				});
				// can create and read whatever
				can([Action.CREATE, Action.READ], Comment);
				// cant update, delete others'
				cannot([Action.UPDATE, Action.DELETE], Comment, {
					userId: { $ne: new mongoose.Types.ObjectId(user.id) as unknown as string },
				});
			}
			// user on POST COMMENTS
			if (options?.post) {
				// cannot access comment on post user doesn't have access to
				const ability = this.createForUser(user);
				const canReadPost = ability.can(Action.READ, subject(SocialPost.name, options.post));
				// if can read post
				if (canReadPost)
					// cannot do anything with comment not belonging to post
					cannot(Action.MANAGE, Comment, {
						rootId: { $ne: new mongoose.Types.ObjectId(options.post.id) as unknown as string },
						rootType: { $ne: SystemEntity.POST },
					});
				// cannot do anything with comment on post with no read access
				else cannot(Action.MANAGE, Comment);
			}
		}

		// https://github.com/microsoft/TypeScript/issues/3841
		// returns a class btw
		return build({
			detectSubjectType: item => {
				const typeString = (item as ForcedSubject<string>).__caslSubjectType__;

				// no need to return .constructor() of this
				if (typeString && typeString in subjectTypeMap) {
					return subjectTypeMap[
						typeString as keyof typeof subjectTypeMap
					] as ExtractSubjectType<Subjects>;
				}

				return item.constructor as ExtractSubjectType<Subjects>;
			},
		});
	}
}
