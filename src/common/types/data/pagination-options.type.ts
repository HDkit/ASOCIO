export type CursorPaginationOption<T> = {
	cursor?: T;
	limit?: number;
};

export type OffsetPaginationOption = {
	page?: number;
	limit?: number;
};
