import { SortOrder } from '@common/enums';
import { LowerBound } from '@common/types/utils';

import {
	CreateType,
	IBaseEntity,
	ISoftDeletableEntity,
	Populated,
	QuerriableType,
} from '../entities';

export type SortOptions<T> = Partial<Record<keyof Populated<T>, SortOrder>>;

/** will be appended to each repo methods */
export type RepoOptions<T> = {
	filter?: QuerriableType<T>;
	/** Array of path, if you don't want the path transformed to fit the type Populated, add an underscore after the path. (eg. `PathName_`) */
	populate?: string[];
	sort?: SortOptions<T>;
};

export type QueryOptions<T> = {
	/** Whether to skip the default repoOptions
	 * Default value is false | undefined
	 */
	doNotUseRepoOptions?: boolean | (keyof RepoOptions<T>)[];
	/** Set your own options for this query only */
	customRepoOptions?: Partial<RepoOptions<T>>;
	limit?: number;
	skip?: number;
};

export interface IBaseRepository<T extends IBaseEntity> {
	repoOptions: RepoOptions<T>;
	/** `create` but with looser type restriction */
	createSoft(data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	create(data: CreateType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	upsert(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>>;
	update(id: string, data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	delete(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	findOneBy(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T> | null>;
	findOneByOrFail(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	findOneById(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T> | null>;
	findOneByIdOrFail(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
	find(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>[]>;
	findOneByAndUpdate(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>>;
	findOneByAndDelete(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>>;
	count(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<number>;
	exists(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<boolean>;
}

export interface ISoftDeleteBaseRepository<
	// diabolical typing :smug:
	// basically whatever type of the fields of ISoftDeletable will need to be exact
	// eg. deleted is boolean, not true, nor boolean | null
	T extends ISoftDeletableEntity & LowerBound<T, ISoftDeletableEntity>,
> extends IBaseRepository<T> {
	softDelete(
		id: string,
		deletedBy: string | null,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>>;
	findOneByAndSoftDelete(
		where: QuerriableType<T>,
		deletedBy: string | null,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>>;
	restore(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>>;
}
