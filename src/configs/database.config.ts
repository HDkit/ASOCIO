import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { IEnvVars } from '@configs/config';

export default (configService: ConfigService<IEnvVars>): MongooseModuleOptions => ({
	uri: configService.get('database', { infer: true })!.uri,
});
