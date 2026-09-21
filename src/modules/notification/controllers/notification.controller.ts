import { Controller, Get, MessageEvent, Param, Req, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ResponseTransform } from '@common/decorators';
import { AuthenticatedRequest, CursorPaginatedData } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { ResponseNotificationDto } from '../dto';
import { NotificationService } from '../providers';

@Controller()
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Sse('sse')
	sse(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
		const uid = req.user.id;
		return this.notificationService.subscribe(uid);
	}

	@Get()
	@ResponseTransform({ pagination: true })
	async getOwnNotifications(
		@Req() req: AuthenticatedRequest,
	): Promise<CursorPaginatedData<ResponseNotificationDto>> {
		const foundNotifications = await this.notificationService.getNotificationsOf(req.user.id);
		return new CursorPaginatedData(
			foundNotifications.nextCursor,
			plainToInstanceStrict(ResponseNotificationDto, foundNotifications.foundNotifications),
		);
	}

	@Get(':notifid')
	async readNotification(@Param('notifid') notifid: string): Promise<ResponseNotificationDto> {
		const readNotification = await this.notificationService.readNotification(notifid);
		return plainToInstanceStrict(ResponseNotificationDto, readNotification);
	}
}
