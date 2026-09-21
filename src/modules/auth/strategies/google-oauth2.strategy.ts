import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { IEnvVars } from '@configs/config';

import { User } from '@modules/user/entities';

import { AuthService } from '../providers';

@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly configService: ConfigService<IEnvVars>,
		private readonly authService: AuthService,
	) {
		const env = configService.get('googleOAuth2', { infer: true })!;

		super({
			clientID: env.clientId,
			clientSecret: env.secret,
			callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
			scope: ['email', 'profile'],
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	): Promise<User | null> {
		return this.authService.validateWithGoogle(profile);
	}
}
