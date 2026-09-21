import mongoose from 'mongoose';

export const toString = (value: mongoose.Types.ObjectId | mongoose.Types.ObjectId[] | null) => {
	if (Array.isArray(value)) {
		return value.map(v => v.toString());
	}
	return value?.toString() || null;
};
