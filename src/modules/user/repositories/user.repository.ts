import { CreateType, Populated, QuerriableType } from '@common/crud/entities';
import { ISoftDeleteBaseRepository, QueryOptions } from '@common/crud/repos';

import { User } from '../entities';
import { UserGoogleRegisterInput, UserRegisterInput } from '../types';

export interface IUserRepository extends ISoftDeleteBaseRepository<User> {
	createForRegistration(
		data: CreateType<UserRegisterInput>,
		queryOptions?: QueryOptions<User>,
	): Promise<Populated<User>>;

	createForGoogleRegistration(
		data: CreateType<UserGoogleRegisterInput>,
		queryOptions?: QueryOptions<User>,
	): Promise<Populated<User>>;

	findOneByUsername(username: string): Promise<Populated<User> | null>;

	/** Find a user matching the where options & match criterias to still be able to login */
	findOneLoginable(where: QuerriableType<User>): Promise<Populated<User> | null>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
