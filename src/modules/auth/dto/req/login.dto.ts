import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Validate } from 'class-validator';

import { IsEmailOrPhone } from '@common/validators';

export class LoginDto {
	@Expose()
	@IsString()
	@Validate(IsEmailOrPhone)
	id!: string;

	@Expose()
	@IsNotEmpty()
	@IsString()
	password!: string;
}
