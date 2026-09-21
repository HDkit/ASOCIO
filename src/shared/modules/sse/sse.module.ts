import { Module } from '@nestjs/common';

import { SseService } from './providers/sse.service';

@Module({
	providers: [SseService],
	exports: [SseService],
})
export class SseModule {}
