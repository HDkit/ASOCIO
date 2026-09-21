import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { GRACE_PERIOD } from '@common/constants';
import { CreateType, Populated, QuerriableType } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl, QueryOptions } from '@common/crud/repos';

import { User } from '../entities';
import { UserGoogleRegisterInput, UserRegisterInput } from '../types';
import { IUserRepository } from './user.repository';

@Injectable()
export class UserRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<User>
	implements IUserRepository
{
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
		super(userModel, User, {
			populate: ['deletedBy'],
		});
	}

	async createForRegistration(
		data: CreateType<UserRegisterInput>,
		queryOptions?: QueryOptions<User>,
	): Promise<Populated<User>> {
		return this.createSoft(data, queryOptions);
	}

	async createForGoogleRegistration(
		data: CreateType<UserGoogleRegisterInput>,
		queryOptions?: QueryOptions<User>,
	): Promise<Populated<User>> {
		return this.createSoft(data, queryOptions);
	}

	async findOneByUsername(username: string): Promise<Populated<User> | null> {
		const foundUser = this.findOneBy({ username });
		return foundUser;
	}

	async findOneLoginable(where: QuerriableType<User>): Promise<Populated<User> | null> {
		const filter: FilterQuery<User> = this.transformFilter({
			...where,
			$or: [
				{ deleted: false },
				{
					$expr: { $eq: ['$deletedBy', '$_id'] },
					deletedAt: { $gte: new Date(Date.now() - GRACE_PERIOD * 24 * 60 * 60 * 1000) },
				},
			],
		});
		return this.findOneBy(filter, { doNotUseRepoOptions: ['filter'] });
	}
}
