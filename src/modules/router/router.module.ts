import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AdminModule } from '@modules/admin';
import { AuthModule } from '@modules/auth';
import { DevModule } from '@modules/dev';
import { EventModule } from '@modules/event';
import { NotificationModule } from '@modules/notification';
import { PostModule } from '@modules/post';
import { UserModule } from '@modules/user';

@Module({
	imports: [
		RouterModule.register([
			{ path: '/auth', module: AuthModule },
			{ path: '/notifications', module: NotificationModule },
			{
				path: '/admin',
				module: AdminModule,
			},
			{
				path: '/client',
				children: [
					{ path: '/events', module: EventModule },
					{
						path: '/posts',
						module: PostModule,
					},
					{ path: '/users', module: UserModule },
				],
			},
			{ path: '/dev', module: DevModule },
		]),
	],
})
export class RouteModule {}
