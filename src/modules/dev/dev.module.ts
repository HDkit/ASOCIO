import { Module } from '@nestjs/common';

import { DevController } from './controllers';

@Module({
	controllers: [DevController],
})
export class DevModule {}
