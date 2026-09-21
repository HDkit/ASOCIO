import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, PRIORITY_ROLES_KEY } from '@common/decorators';
import { Role } from '@common/enums';
import { AuthenticatedRequest } from '@common/types/data';

const rolePriorityMap: Record<Role, number> = {
	[Role.ADMIN]: 99,
	[Role.MODERATOR]: 98,
	[Role.USER]: 1,
	[Role.SETTING_UP]: 0,
};

@Injectable()
export class PriorityRoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const roleRequiredForRoute = this.reflector.getAllAndOverride<Role | undefined>(
			PRIORITY_ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!roleRequiredForRoute) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

		if (user.roles.some(role => rolePriorityMap[role] >= rolePriorityMap[roleRequiredForRoute]))
			return true;
		throw new ForbiddenException(
			`Must have a role with higher priority than ${roleRequiredForRoute}`,
		);
	}
}
