export const str2bool = (str: string): boolean | null => {
	if (['true', 'True', 'TRUE', '1', 'yes'].includes(str)) return true;
	if (['false', 'False', 'FALSE', '0', 'no'].includes(str)) return false;
	return null;
};
