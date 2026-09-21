import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	isEmail,
	isPhoneNumber,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhone implements ValidatorConstraintInterface {
	validate(value: string) {
		return isPhoneNumber(value) || isEmail(value);
	}

	defaultMessage(validationArguments?: ValidationArguments) {
		return `${validationArguments?.property} must be a valid email or phone number`;
	}
}
