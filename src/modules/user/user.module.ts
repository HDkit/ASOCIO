import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AuthModule } from '@modules/auth';
import { RelationshipModule } from '@modules/relationship';

import { FileHostModule } from '@shared/modules/file-host';

import { UserController, UserRelationshipController } from './controllers';
import { User, UserSchema } from './entities';
import { UserService } from './providers';
import { IUserRepositoryToken } from './repositories/user.repository';
import { UserRepositoryImpl } from './repositories/user.repository.impl';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		NestjsFormDataModule,
		FileHostModule,
		forwardRef(() => AuthModule),
		RelationshipModule,
	],
	controllers: [UserController, UserRelationshipController],
	providers: [
		UserService,
		{
			provide: IUserRepositoryToken,
			useClass: UserRepositoryImpl,
		},
	],
	exports: [UserService, IUserRepositoryToken],
})
export class UserModule {}
