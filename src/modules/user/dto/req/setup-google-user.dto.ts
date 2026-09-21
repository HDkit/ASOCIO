import { PickType } from '@nestjs/mapped-types';

import { UpdateUserDto } from './update-user.dto';

export class SetupGoogleUserDto extends PickType(UpdateUserDto, [
	'avatar',
	'username',
	'password',
	'mail',
	'phone',
]) {}
