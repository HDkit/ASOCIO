import { accessibleBy } from '@casl/mongoose';
import { Injectable } from '@nestjs/common';

import { Action } from '@common/enums';
import { ConcreteClass } from '@common/types/utils';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { CaslAbilityFactory, UserAbilityOptions } from './casl-ability.factory';

@Injectable()
export class CaslFilterFactory {
	constructor(private readonly caslAbilityFactory: CaslAbilityFactory) {}

	/**
	 * returns { $expr: { $eq: [0, 1] } } if undefined rule or if user doesn't exist
	 */
	createFilterForUser(forType: ConcreteClass<any>, action: Action, options?: UserAbilityOptions) {
		const user = CustomRequestCtx.get().req.user;
		if (!user) return { $expr: { $eq: [0, 1] } };
		const ability = this.caslAbilityFactory.createForUser(user, options);
		const filter = accessibleBy(ability, action).ofType(forType);
		return filter;
	}
}
