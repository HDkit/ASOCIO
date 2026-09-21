import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { FileHostService } from './providers/file-host.service';

@Module({
	imports: [
		HttpModule.register({
			timeout: 100000,
			maxRedirects: 1,
			baseURL: 'https://upload.imagekit.io',
		}),
	],
	providers: [FileHostService],
	exports: [FileHostService, HttpModule],
})
export class FileHostModule {}
