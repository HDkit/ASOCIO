import { OmitType, PickType } from '@nestjs/mapped-types';
import { Exclude, Expose, Transform } from 'class-transformer';

import { Location, Sport } from '../../entities';
import { Status } from '../../enums';

@Exclude()
export class ResponseUserDto {
	@Expose()
	id!: string;

	@Expose()
	username!: string;

	@Expose()
	roles!: string[];

	@Expose()
	avatarUrl!: string | null;

	@Expose()
	@Transform(({ obj, value }) =>
		obj instanceof ResponseUserDto && (value as Location).hidden ? undefined : (value as Location),
	)
	location!: Location;

	@Expose()
	status!: Status;

	@Expose()
	sports!: Sport[];
}

export class LimitedUserResponseDto extends OmitType(ResponseUserDto, ['location', 'roles']) {}

export const MoreLimitedUserResponseDto = (
	keys?: (keyof InstanceType<typeof LimitedUserResponseDto>)[],
) => {
	return keys ? PickType(LimitedUserResponseDto, keys) : LimitedUserResponseDto;
};
