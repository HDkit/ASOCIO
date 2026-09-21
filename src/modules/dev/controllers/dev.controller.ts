import { Controller, Get, UseGuards, Version } from '@nestjs/common';

import { PriorityRole, Roles } from '@common/decorators';
import { Role } from '@common/enums';
import { RolesGuard } from '@common/guards';

@Roles(Role.ADMIN, Role.MODERATOR)
@Controller()
export class DevController {
	@Get()
	entry() {
		return 'Dev route';
	}

	// New protected routes to test RBAC
	// These routes' return values do not follow the ResponseEntity interface

	@Version('1')
	@Get('admin-only')
	@UseGuards(RolesGuard)
	@Roles(Role.ADMIN)
	adminOnlyRoute() {
		return { message: 'This route is accessible to admin' };
	}

	@Version('1')
	@Get('moderator-and-admin')
	@UseGuards(RolesGuard)
	@Roles(Role.MODERATOR, Role.ADMIN)
	moderatorAndAdminRoute() {
		return { message: 'This route is accessible to moderators and admin' };
	}

	@Version('1')
	@Get('all-users')
	@Roles()
	allUsersRoute() {
		return { message: 'This route is accessible to all authenticated users' };
	}

	@Version('1')
	@Get('gte-moderator')
	@PriorityRole(Role.MODERATOR)
	gteModeratorRoute() {
		return { message: 'This route is accessible to moderators and above' };
	}
}
