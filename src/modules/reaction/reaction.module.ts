import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Reaction, ReactionSchema } from './entities';
import { ReactionService } from './providers';
import { IReactionRepositoryToken, ReactionRepositoryImpl } from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Reaction.name,
				schema: ReactionSchema,
			},
		]),
	],
	providers: [
		ReactionService,
		{
			provide: IReactionRepositoryToken,
			useClass: ReactionRepositoryImpl,
		},
	],
	exports: [ReactionService, IReactionRepositoryToken],
})
export class ReactionModule {}
