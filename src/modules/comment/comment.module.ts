import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { NotificationModule } from '@modules/notification';
import { ReactionModule } from '@modules/reaction';

import { CaslModule, DataServiceModule, FileHostModule } from '@shared/modules';

import { Comment, CommentSchema } from './entities';
import { CommentService } from './providers';
import { CommentRepositoryImpl, ICommentRepositoryToken } from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Comment.name,
				schema: CommentSchema,
			},
		]),
		FileHostModule,
		NestjsFormDataModule,
		ReactionModule,
		CaslModule,
		DataServiceModule,
		NotificationModule,
	],
	providers: [
		CommentService,
		{
			provide: ICommentRepositoryToken,
			useClass: CommentRepositoryImpl,
		},
	],
	exports: [CommentService, ICommentRepositoryToken],
})
export class CommentModule {}
