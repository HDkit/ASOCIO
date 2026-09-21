import { User } from '../entities';

export type UserRegisterInput = Pick<
	User,
	'username' | 'password' | 'mail' | 'phone' | 'hasFinishedSetup'
>;
export type UserGoogleRegisterInput = Pick<
	User,
	'avatarUrl' | 'username' | 'password' | 'mail' | 'googleLoginInfo' | 'hasFinishedSetup'
>;
