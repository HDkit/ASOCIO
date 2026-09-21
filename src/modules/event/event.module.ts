import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { PostModule } from '@modules/post';

import { DataServiceModule, FileHostModule } from '@shared/modules';

import { EventController } from './controllers/event.controller';
import { Event, EventParticipant, EventParticipantSchema, EventSchema } from './entities';
import { EventService } from './providers/event.service';
import {
	EventParticipantRepositoryImpl,
	EventRepositoryImpl,
	IEventParticipantRepositoryToken,
	IEventRepositoryToken,
} from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Event.name,
				schema: EventSchema,
			},
			{
				name: EventParticipant.name,
				schema: EventParticipantSchema,
			},
		]),
		DataServiceModule,
		PostModule,
		FileHostModule,
		NestjsFormDataModule,
	],
	controllers: [EventController],
	providers: [
		EventService,
		{
			provide: IEventParticipantRepositoryToken,
			useClass: EventParticipantRepositoryImpl,
		},
		{
			provide: IEventRepositoryToken,
			useClass: EventRepositoryImpl,
		},
	],
})
export class EventModule {}
