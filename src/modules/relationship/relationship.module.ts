import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '@modules/notification';

import { Block, BlockSchema, Friendship, FriendshipSchema } from './entities';
import { RelationshipService } from './providers';
import {
	IBlockRepositoryToken,
	IFriendshipRepositoryToken,
} from './repositories/relationship.repository';
import {
	BlockRepositoryImpl,
	FriendshipRepositoryImpl,
} from './repositories/relationship.repository.impl';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Friendship.name,
				schema: FriendshipSchema,
			},
			{
				name: Block.name,
				schema: BlockSchema,
			},
		]),
		NotificationModule,
	],
	providers: [
		RelationshipService,
		{
			provide: IFriendshipRepositoryToken,
			useClass: FriendshipRepositoryImpl,
		},
		{
			provide: IBlockRepositoryToken,
			useClass: BlockRepositoryImpl,
		},
	],
	exports: [RelationshipService, IFriendshipRepositoryToken, IBlockRepositoryToken],
})
export class RelationshipModule {}
