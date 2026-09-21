import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
	@Expose()
	@IsNotEmpty({ message: 'Username is required' })
	username!: string;

	@Expose()
	@IsStrongPassword()
	password!: string;

	@Expose()
	@IsEmail()
	mail!: string;

	@Expose()
	@IsPhoneNumber()
	phone!: string;
}
