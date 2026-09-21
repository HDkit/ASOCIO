import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { isValidId } from '@common/validators';

@Injectable()
export class ValidateIdPipe implements PipeTransform {
	transform(value: string): string {
		if (!isValidId(value)) {
			throw new BadRequestException(`Invalid ObjectId: ${value}`);
		}
		return value; // return as string
	}
}
