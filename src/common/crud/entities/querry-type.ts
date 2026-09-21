import { IBaseEntity } from './base-entity.type';
import { ISoftDeletableEntity } from './softdeletable-entity.type';

/**
 * for each property in type T, adds an optional property TPopulated?: unknown to the type
 */
export type Populated<T> = T & {
	[K in keyof T as `${string & K}Populated`]?: unknown;
};

/**
 * allow field with array value to take in type of a single element
 */
type ExpandArray<T> = T extends Array<infer U> | ReadonlyArray<infer U> ? T | U : T;

/**
 * get the closest entity type the target type extends from
 */
type EntityType<T> = T extends ISoftDeletableEntity ? ISoftDeletableEntity : IBaseEntity;

/**
 * type used for querrying
 */
export type QuerriableType<T> = {
	[P in keyof T]?: ExpandArray<T[P]>;
};

/**
 * make nullable keys and keys in EntityType become optional
 * other keys stay the same
 */
export type CreateType<T> = {
	[K in keyof T as null extends T[K] ? never
	: K extends keyof EntityType<T> ? never
	: K]: T[K];
} & Partial<T>;
