import { RequestContext } from 'nestjs-request-context';

import { AuthenticatedRequest, CustomRequest } from '@common/types/data';

export class CustomRequestCtx {
	static get(): RequestContext<CustomRequest> {
		return RequestContext.currentContext as RequestContext<CustomRequest>;
	}

	static getAuthenticated(): RequestContext<AuthenticatedRequest> {
		return RequestContext.currentContext as RequestContext<AuthenticatedRequest>;
	}
}
