import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	Patch,
	Req,
	Version,
	forwardRef,
} from '@nestjs/common';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { PriorityRole } from '@common/decorators';
import { Role } from '@common/enums';
import { AuthenticatedRequest } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { TokenService } from '@modules/auth';
import { ResponseAuthDto } from '@modules/auth/dto';
import { createPayload, tokensSchema } from '@modules/auth/types';

import {
	LimitedUserResponseDto,
	ResponseProfileDto,
	SetupGoogleUserDto,
	SetupUserDto,
	UpdateUserDto,
} from '../dto';
import { UserService } from '../providers';

@PriorityRole(Role.USER)
@Controller()
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(forwardRef(() => TokenService)) private readonly tokenService: TokenService,
	) {}

	@Version('1')
	@Get('me')
	@PriorityRole(Role.SETTING_UP)
	async profile(@Req() request: AuthenticatedRequest): Promise<ResponseProfileDto> {
		const profile = await this.userService.findOneById(request.user.id);
		return plainToInstanceStrict(ResponseProfileDto, profile);
	}

	@Version('1')
	@Get('other/:userid')
	@PriorityRole(Role.SETTING_UP)
	async profileOf(@Param('userid') userId: string): Promise<ResponseProfileDto> {
		const profile = await this.userService.findOneById(userId);
		return plainToInstanceStrict(ResponseProfileDto, profile);
	}

	@Version('1')
	@Patch('setup')
	@FormDataRequest({ storage: MemoryStoredFile })
	@PriorityRole(Role.SETTING_UP)
	async setupProfile(
		@Req() request: AuthenticatedRequest,
		@Body() body: SetupUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const finishedProfile = await this.userService.updateWithSetup(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(finishedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, finishedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Patch('setup/google')
	@FormDataRequest({ storage: MemoryStoredFile })
	@PriorityRole(Role.SETTING_UP)
	async setupProfileForGoogle(
		@Req() request: AuthenticatedRequest,
		@Body() body: SetupGoogleUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const finishedProfile = await this.userService.updateWithSetup(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(finishedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, finishedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Patch('me')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updateProfile(
		@Req() request: AuthenticatedRequest,
		@Body() body: UpdateUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const updatedProfile = await this.userService.update(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(updatedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, updatedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Delete('deactivate')
	@PriorityRole(Role.SETTING_UP)
	async deactivateProfile(@Req() request: AuthenticatedRequest): Promise<ResponseProfileDto> {
		const deletedProfile = await this.userService.softDelete(request.user.id, request.user.id);
		return plainToInstanceStrict(ResponseProfileDto, deletedProfile);
	}

	@Version('1')
	@Get()
	@PriorityRole(Role.SETTING_UP)
	async getProfiles(): Promise<LimitedUserResponseDto[]> {
		const foundUser = await this.userService.findAny({});
		return plainToInstanceStrict(LimitedUserResponseDto, foundUser);
	}
}
