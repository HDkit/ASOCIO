import { Injectable, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import 'events';
import { Observable, fromEvent, map } from 'rxjs';

@Injectable()
export class SseService {
	constructor(private emitter: EventEmitter2) {}

	subscribe(channel: string): Observable<MessageEvent> {
		const observable = fromEvent(this.emitter, channel).pipe(
			map(data => ({
				data: data as string | object,
			})),
		);
		return observable;
	}

	sendToUser(channel: string, data?: string | object) {
		return this.emitter.emit(channel, data);
	}

	countListeners(channel: string) {
		return this.emitter.listenerCount(channel);
	}
}
