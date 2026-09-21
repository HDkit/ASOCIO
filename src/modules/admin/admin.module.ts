import { Module } from '@nestjs/common';

import { AdminController } from './controllers/admin.controller';
import { AdminService } from './providers/admin.service';

@Module({
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
