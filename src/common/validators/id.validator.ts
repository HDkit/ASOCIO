export function isValidId(value: unknown): boolean {
	// It's just ObjectId but extensible, changable in the future and users can't know it's ObjectId
	const objectIdPattern = /^[a-fA-F0-9]{24}$/;
	return typeof value === 'string' && objectIdPattern.test(value);
}
