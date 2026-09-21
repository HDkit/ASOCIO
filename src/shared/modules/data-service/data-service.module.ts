import { Module } from '@nestjs/common';

import { MongooseSessionService } from './providers/mongoose-session.service';
import { ISessionServiceToken } from './providers/session.service';

@Module({
	providers: [{ provide: ISessionServiceToken, useClass: MongooseSessionService }],
	exports: [ISessionServiceToken],
})
export class DataServiceModule {}
