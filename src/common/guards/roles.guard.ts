import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, ROLES_KEY } from '@common/decorators';
import { Role } from '@common/enums';
import { AuthenticatedRequest } from '@common/types/data';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const rolesRequiredForRoute = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!rolesRequiredForRoute || rolesRequiredForRoute.length == 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

		const hasRequiredRoles = rolesRequiredForRoute.some(role => user.roles?.includes(role));

		if (!hasRequiredRoles) {
			const rolesList = rolesRequiredForRoute.join(', ');
			throw new ForbiddenException(`Access denied. Allowed role(s): ${rolesList}`);
		}

		return hasRequiredRoles;
	}
}
