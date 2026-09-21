import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

import { isValidId } from '@common/validators';

export function IsValidId(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'IsValidId',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [validationOptions],
			validator: {
				validate(value: any, args: ValidationArguments): boolean {
					const options = args.constraints?.[0] as ValidationOptions | undefined;
					const each = options?.each;

					if (each && Array.isArray(value)) {
						return value.every(v => isValidId(v));
					}
					return isValidId(value);
				},

				defaultMessage(args: ValidationArguments): string {
					const options = args.constraints?.[0] as ValidationOptions | undefined;
					const value = args.value as unknown;

					if (options?.each && Array.isArray(value)) {
						const invalids = value.filter(v => !isValidId(v));
						return `${args.property} contains invalid IDs: ${invalids.join(', ')} must be 24-character lowercase hexadecimal string`;
					}

					if (typeof options?.message === 'function') {
						return options.message(args);
					}

					return (
						options?.message ??
						`${args.property} must be a 24-character lowercase hexadecimal string`
					);
				},
			},
		});
	};
}
