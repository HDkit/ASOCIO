import { Document } from 'mongoose';

export function nonEmptyAfterCreate(this: Document, val: string | null) {
	if (this.isNew) {
		return true;
	}
	// after creation, don't allow null or undefined
	return val !== null && val !== undefined;
}
