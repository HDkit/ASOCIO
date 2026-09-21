import { Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { CreateType, Populated } from '@common/crud/entities';
import { Role } from '@common/enums';

import { FileHostService } from '@shared/modules/file-host/providers/file-host.service';

import { User } from '../entities';
import { IUserRepository, IUserRepositoryToken } from '../repositories/user.repository';
import { UserGoogleRegisterInput, UserRegisterInput } from '../types';

@Injectable()
export class UserService {
	constructor(
		@Inject(IUserRepositoryToken) private readonly userRepository: IUserRepository,
		private readonly fileHostService: FileHostService,
	) {}

	async create(data: CreateType<User>): Promise<Populated<User>> {
		const newUser = this.userRepository.create(data);
		return newUser;
	}

	async register(
		data: Omit<CreateType<UserRegisterInput>, 'hasFinishedSetup'>,
	): Promise<Populated<User>> {
		const newUser = this.userRepository.createForRegistration({ ...data, hasFinishedSetup: false });
		return newUser;
	}

	async registerGoogle(
		data: Omit<CreateType<UserGoogleRegisterInput>, 'hasFinishedSetup'>,
	): Promise<Populated<User>> {
		const newUser = this.userRepository.createForGoogleRegistration({
			...data,
			hasFinishedSetup: false,
		});
		return newUser;
	}

	async update(
		id: string,
		data: Partial<User> & { avatar?: MemoryStoredFile },
	): Promise<Populated<User>> {
		if (data.avatar) data.avatarUrl = await this.fileHostService.file2Url(data.avatar);
		const updatedUser = this.userRepository.update(id, data);
		return updatedUser;
	}

	async updateWithSetup(
		id: string,
		data: Partial<User> & { avatar?: MemoryStoredFile },
	): Promise<Populated<User>> {
		data.hasFinishedSetup = true;
		data.roles = [Role.USER];
		return this.update(id, data);
	}

	async findOneByUsername(username: string): Promise<Populated<User> | null> {
		const foundUser = this.userRepository.findOneByUsername(username);
		return foundUser;
	}

	async findOneById(id: string): Promise<Populated<User>> {
		const foundUser = this.userRepository.findOneByIdOrFail(id);
		return foundUser;
	}

	async findOneBy(options: Partial<User>): Promise<Populated<User> | null> {
		return this.userRepository.findOneBy(options);
	}

	async find(options: Partial<User>): Promise<Populated<User>[]> {
		return this.userRepository.find(options);
	}

	async softDelete(id: string, deletedBy: string | null = null): Promise<Populated<User>> {
		return this.userRepository.softDelete(id, deletedBy);
	}

	async restore(id: string): Promise<Populated<User>> {
		return this.userRepository.restore(id);
	}

	async findLoginable(options: Partial<User>): Promise<Populated<User> | null> {
		return this.userRepository.findOneLoginable(options);
	}

	async findLoginableAndRestore(options: Partial<User>): Promise<Populated<User> | null> {
		const user = await this.userRepository.findOneLoginable(options);
		return user ? this.userRepository.restore(user.id) : null;
	}

	async findAny(options: Partial<User>): Promise<Populated<User>[]> {
		return this.userRepository.find(options, { doNotUseRepoOptions: ['filter'] });
	}
}
