import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

import { IEnvVars } from '@configs/config';

export default (configService: ConfigService<IEnvVars>): JwtModuleOptions => ({
	secret: configService.get('jwt', { infer: true })!.refreshSecret,
	signOptions: { expiresIn: configService.get('jwt', { infer: true })!.refreshTokenExpiration },
});
