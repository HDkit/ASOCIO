import { IntersectionType, PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';
import { SetupUserDto } from './setup-user.dto';

export class UpdateUserDto extends IntersectionType(
	PartialType(CreateUserDto),
	PartialType(SetupUserDto),
) {}
