import { Exclude, Expose, Transform } from 'class-transformer';

import { Populated } from '@common/crud/entities';

import { User } from '@modules/user/entities';

import { Reaction } from '../../entities';

@Exclude()
export class ResponseReactionUsersDto {
	@Expose()
	@Transform(({ obj }: { obj: Populated<Reaction> }) => (obj.userIdPopulated as User | null)?.id)
	userId!: string;

	@Expose()
	@Transform(
		({ obj }: { obj: Populated<Reaction> }) => (obj.userIdPopulated as User | null)?.avatarUrl,
	)
	avatarUrl!: string;

	@Expose()
	@Transform(
		({ obj }: { obj: Populated<Reaction> }) => (obj.userIdPopulated as User | null)?.username,
	)
	username!: string;
}
