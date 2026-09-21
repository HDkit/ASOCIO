import { Body, Controller, Get, Post, Req, UseGuards, Version } from '@nestjs/common';
import { Request } from 'express';

import { Public } from '@common/decorators';
import { AuthenticatedRequest } from '@common/types/data';

import { User } from '@modules/user/entities';

import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { GoogleOAuth2Guard, JwtRefreshAuthGuard } from '../guards';
import { AuthService } from '../providers';

@Public()
@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Version('1')
	@Post('login')
	async login(@Body() body: LoginDto): Promise<ResponseAuthDto> {
		const tokens = await this.authService.login(body.id, body.password);
		return tokens;
	}

	@Version('1')
	@Post('register')
	async register(
		@Body()
		body: RegisterDto,
	): Promise<ResponseAuthDto> {
		const tokens = await this.authService.register(
			body.username,
			body.password,
			body.mail,
			body.phone,
		);
		return tokens;
	}

	@Version('1')
	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshToken(@Req() req: AuthenticatedRequest): Promise<ResponseAuthDto> {
		const tokens = await this.authService.refreshToken({
			sub: req.user,
		});
		return tokens;
	}

	@Version('1')
	@Get('google')
	@UseGuards(GoogleOAuth2Guard)
	googleing() {
		// Handled by passport redirect
	}

	@Version('1')
	@Get('google/callback')
	@UseGuards(GoogleOAuth2Guard)
	async googleCallback(@Req() request: Request): Promise<ResponseAuthDto> {
		const user = request.user as User;
		const tokens = await this.authService.loginWithGoogle(user);
		return tokens;
	}
}
