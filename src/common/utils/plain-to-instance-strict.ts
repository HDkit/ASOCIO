import { ClassTransformOptions, plainToInstance } from 'class-transformer';

import { ConcreteClass } from '@common/types/utils';

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: ConcreteClass<T>,
	plain: V[],
	options?: ClassTransformOptions,
): T[];

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: ConcreteClass<T>,
	plain: V,
	options?: ClassTransformOptions,
): T;

/** `plainToInstance` wrapper function with `excludeExtraneousValues` set to `true` */
export function plainToInstanceStrict<T, V>(
	cls: ConcreteClass<T>,
	plain: V | V[],
	options?: ClassTransformOptions,
) {
	return plainToInstance(cls, plain, { excludeExtraneousValues: true, ...options });
}
