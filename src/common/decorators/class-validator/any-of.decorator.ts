import { applyDecorators } from '@nestjs/common';
import { ValidateIf } from 'class-validator';

/**
 * class-level decorator
 *
 * Validates if at least one of the included properties is not undefined.
 * Fails validation if all of the included properties are not defined.
 * Do not annotate the included properties with IsOptional().
 */
export function AnyOf(properties: string[]) {
	return function (target: { prototype: any }) {
		for (const property of properties) {
			const otherProps = properties.filter(prop => prop !== property);
			const decorators = [
				// Validates if all other properties are undefined.
				ValidateIf(
					(obj: { [property]: any }) =>
						obj[property] !== undefined ||
						otherProps.reduce((acc, prop) => acc && obj[prop] === undefined, true),
				),
			];

			for (const decorator of decorators) {
				applyDecorators(decorator)(target.prototype, property);
			}
		}
	};
}
