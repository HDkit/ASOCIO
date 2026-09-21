import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isEmpty, isPhoneNumber } from 'class-validator';
import { randomUUID } from 'crypto';
import { Profile } from 'passport-google-oauth20';

import { UserService } from '@modules/user';
import { User } from '@modules/user/entities';

import { Payload, Sub, Tokens, createPayload } from '../types';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
	) {}

	async login(id: string, password: string): Promise<Tokens> {
		const user = await this.validateWithPhoneOrMail(id, password);
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async register(username: string, password: string, mail: string, phone: string): Promise<Tokens> {
		const user = await this.userService.register({ username, password, mail, phone });
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async loginWithGoogle(user: User): Promise<Tokens> {
		const tokens = await this.tokenService.generateTokens(createPayload(user), true);
		return tokens;
	}

	async validateWithPhoneOrMail(id: string, password: string): Promise<User> {
		if (isEmpty(password)) throw new UnauthorizedException(`Please provide non-empty password.`);
		const isLoggedInViaPhone = isPhoneNumber(id);
		const findOptions = isPhoneNumber(id) ? { phone: id } : { mail: id };
		const user = await this.userService.findLoginableAndRestore(findOptions);
		if (!user) {
			throw new ForbiddenException(
				`${isLoggedInViaPhone ? 'Phone number' : 'Email'} not found or your account has been deactivated`,
			);
		}
		const isPasswordValid =
			user.password !== null && (await bcrypt.compare(password, user.password));
		if (!isPasswordValid) {
			throw new ForbiddenException('Invalid password');
		}
		return user;
	}

	async validateWithGoogle(profile: Profile): Promise<User | null> {
		const foundUsers = await this.userService.findAny({
			googleLoginInfo: { id: profile.id },
		});
		const foundLoginableUser = await this.userService.findLoginableAndRestore({
			googleLoginInfo: { id: profile.id },
		});
		if (!foundUsers.length) {
			const createdUser = await this.userService.registerGoogle({
				avatarUrl: profile.photos?.[0]?.value || null,
				googleLoginInfo: { id: profile.id },
				mail: profile.emails?.[0]?.value || null,
				username: profile.username || profile.displayName.replace(/\s+/g, '') + randomUUID(),
				password: null,
			});
			return createdUser;
		}
		return foundLoginableUser;
	}

	async validatePayload(payload: Payload): Promise<Sub | null> {
		const user = await this.userService.findOneBy({
			id: payload.sub.id,
			roles: payload.sub.roles,
		});
		if (!user) throw new ForbiddenException('Invalid or expired refresh token');
		return payload.sub;
	}

	async refreshToken(payload: Payload): Promise<Tokens> {
		return await this.tokenService.generateTokens(payload);
	}
}
