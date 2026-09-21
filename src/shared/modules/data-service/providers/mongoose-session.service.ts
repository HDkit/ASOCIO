import { Injectable, Scope } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { ISessionService } from './session.service';

@Injectable({ scope: Scope.REQUEST })
export class MongooseSessionService implements ISessionService<ClientSession> {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private sessionCount = 0;
	private failNextOperations = false;

	get(): ClientSession | null {
		const req = CustomRequestCtx.get().req;
		return req.db.mongoose.session;
	}

	set(session: ClientSession | null): void {
		const req = CustomRequestCtx.get().req;
		req.db.mongoose.session = session;
	}

	async start(): Promise<ClientSession> {
		this.sessionCount++;
		let session = this.get();
		if (session) return session;
		session = await this.connection.startSession();
		session.startTransaction();
		this.set(session);
		return session;
	}

	async abort(): Promise<void> {
		const session = this.get();
		if (session) {
			await session.abortTransaction();
			session.startTransaction();
		}
		this.failNextOperations = true;
	}

	async end(): Promise<void> {
		const session = this.get();
		if (session && this.sessionCount == 1) {
			if (this.failNextOperations) await session.abortTransaction();
			else await session.commitTransaction();
			await session.endSession();
			this.failNextOperations = false;
			this.set(null);
		}
		this.sessionCount = Math.max(0, this.sessionCount - 1);
	}
}
