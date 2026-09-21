import { BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

interface UnionPipeOptions<T extends Record<string, any>, D extends keyof T = keyof T> {
	discriminator: D;
	defaultDiscriminatorValue?: T[D];
	types: Record<T[D], Type<T>>;
}

@Injectable()
export class UnionValidationPipe<T extends Record<string, any>> implements PipeTransform {
	constructor(private readonly options: UnionPipeOptions<T>) {}

	async transform(value: T) {
		const { discriminator, types } = this.options;

		const typeKey = value[discriminator];

		let TargetDtoType = types[typeKey];

		if (!TargetDtoType && this.options.defaultDiscriminatorValue) {
			TargetDtoType = types[this.options.defaultDiscriminatorValue];
		}

		if (!TargetDtoType) {
			throw new BadRequestException(
				`Invalid discriminator "${String(discriminator)}". Expected one of: ${Object.keys(types).join(', ')}`,
			);
		}

		const instance = plainToInstance(TargetDtoType, value);
		const errors = await validate(instance, {
			whitelist: true,
			forbidNonWhitelisted: true,
			forbidUnknownValues: true,
		});

		const errMsg = errors
			.flatMap(err => Object.values(err.constraints ?? {})) // flatten all messages
			.join(', ');

		if (errors.length > 0) {
			throw new BadRequestException(errMsg);
		}

		return instance;
	}
}
