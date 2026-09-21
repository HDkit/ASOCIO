import { SetMetadata } from '@nestjs/common';

export interface ResponseTransformOptions {
	/** Specifies if the response is paginated data. Throws an error if response is not of type PaginatedData<T> or CursorPaginatedData<T>*/
	pagination: boolean;
}

const defaultTransformOptions: Partial<ResponseTransformOptions> = {
	pagination: false,
};

export const IS_RES_TRANSFORM_KEY = 'isResTransformKey';
export const ResponseTransform = (options?: Partial<ResponseTransformOptions>) =>
	SetMetadata(IS_RES_TRANSFORM_KEY, { ...defaultTransformOptions, ...options });
