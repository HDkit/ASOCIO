import { Class } from '@common/types/utils';

import { CustomError } from './custom.error';

export class EntityNotFound<T> extends CustomError {
	constructor(clazz: Class<T> | string) {
		const className = typeof clazz === 'string' ? clazz : clazz.name;
		super(`${className} entity not found`);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
	}
}
