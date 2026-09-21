import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IEnvVars } from '@configs/config';

import { Payload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'access-jwt') {
	constructor(private readonly configService: ConfigService<IEnvVars>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt', { infer: true })!.accessSecret,
		});
	}

	validate(payload: Payload) {
		return payload.sub;
	}
}
