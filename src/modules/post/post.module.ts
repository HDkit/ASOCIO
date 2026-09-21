import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { CommentModule } from '@modules/comment';
import { NotificationModule } from '@modules/notification';
import { ReactionModule } from '@modules/reaction';

import { CaslModule, FileHostModule } from '@shared/modules';

import { PostCommentController, PostController, PostReactionController } from './controllers';
import { SocialPost, SocialPostSchema } from './entities';
import { PostService } from './providers';
import { IPostRepositoryToken, PostRepositoryImpl } from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: SocialPost.name,
				schema: SocialPostSchema,
			},
		]),
		NestjsFormDataModule,
		FileHostModule,
		CommentModule,
		ReactionModule,
		CaslModule,
		NotificationModule,
	],
	controllers: [PostController, PostReactionController, PostCommentController],
	providers: [
		PostService,
		{
			provide: IPostRepositoryToken,
			useClass: PostRepositoryImpl,
		},
	],
	exports: [PostService, IPostRepositoryToken],
})
export class PostModule {}
