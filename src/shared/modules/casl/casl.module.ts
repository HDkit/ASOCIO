import { Module } from '@nestjs/common';

import { CaslAbilityFactory } from './providers/casl-ability.factory';
import { CaslFilterFactory } from './providers/casl-filter.factory';

@Module({
	providers: [CaslAbilityFactory, CaslFilterFactory],
	exports: [CaslAbilityFactory, CaslFilterFactory],
})
export class CaslModule {}
