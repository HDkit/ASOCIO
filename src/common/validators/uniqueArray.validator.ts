import mongoose from 'mongoose';

export function uniqueArrayValidator<T>(val: T[]) {
	if (!Array.isArray(val)) return false;

	const seen = new Set<T>();

	for (const item of val) {
		if (seen.has(item)) return false;
		seen.add(item);
	}

	return true;
}

export function uniqueArrayFieldValidator<T extends object>(key: keyof T) {
	return (val: T[]) => {
		if (!Array.isArray(val)) return false;

		const seen = new Set<any>();

		for (const item of val) {
			const v = item[key];
			if (seen.has(v)) return false;
			seen.add(v);
		}

		return true;
	};
}

export function uniqueArrayValidatorForOID(val: mongoose.Types.ObjectId[]) {
	if (!Array.isArray(val)) return false;

	const seen = new Set<string>();

	for (const item of val) {
		if (seen.has(item.toString())) return false;
		seen.add(item.toString());
	}

	return true;
}
