import { SetMetadata } from '@nestjs/common';

import { Role } from '@common/enums';

export const PRIORITY_ROLES_KEY = 'priority_roles';
export const PriorityRole = (role?: Role) => SetMetadata(PRIORITY_ROLES_KEY, role);
