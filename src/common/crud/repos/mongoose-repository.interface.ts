/**
 * A lot of type assertion due to the excessive use of LowerBound type
 */
import { Model, PopulateOptions } from 'mongoose';

import { SortOrder } from '@common/enums';
import { EntityNotFound } from '@common/exceptions';
import { Class, LowerBound } from '@common/types/utils/';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { IBaseEntity } from '../entities/base-entity.type.js';
import { CreateType, Populated, QuerriableType } from '../entities/querry-type.js';
import { ISoftDeletableEntity } from '../entities/softdeletable-entity.type.js';
import {
	IBaseRepository,
	ISoftDeleteBaseRepository,
	QueryOptions,
	RepoOptions,
	SortOptions,
} from './base-repository.interface.js';

function buildPopulateObject(path: string): PopulateOptions {
	const segments = path.split('.');
	let obj: PopulateOptions = { path: segments.pop()! };

	// Build nested populate backwards
	while (segments.length) {
		const parent = segments.pop()!;
		obj = { path: parent, populate: obj };
	}

	return obj;
}

export class MongooseRepositoryImpl<T extends IBaseEntity> implements IBaseRepository<T> {
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
		repoOptions: RepoOptions<T> = {},
	) {
		// merge the merfed base and subclass with the user set Options
		// since this is the BASE class, field initializer came before constructor is called
		this.repoOptions = {};
		this.mergeRepoOptions(repoOptions);
	}

	repoOptions: RepoOptions<T>;

	protected mergeRepoOptions(repoOptions: RepoOptions<T>) {
		const filter = this.mergeFilter({ ...repoOptions.filter } as QuerriableType<T>);
		const populate = this.mergePopulate([...(repoOptions.populate ?? [])]);
		const sort = this.mergeSort({ ...repoOptions.sort } as Record<keyof T, SortOrder>);
		this.repoOptions = { filter, populate, sort };
	}

	//#region TRANSFORMER
	/** To apply middleware transformation for all class methods */
	protected mergeFilter(filter: QuerriableType<T> = {}) {
		const repoOptions: QuerriableType<T> = this.repoOptions.filter ?? {};
		const merged = {
			...repoOptions,
			...filter,
		};
		return merged;
	}

	protected mergeSort(sort: SortOptions<T> = {}) {
		const repoOptions: SortOptions<T> = this.repoOptions.sort ?? {};
		const merged: SortOptions<T> = {};
		for (const key of Object.keys(sort)) {
			merged[key] = sort[key as keyof T];
		}
		for (const key of Object.keys(repoOptions)) {
			if (!(key in merged)) {
				merged[key] = repoOptions[key as keyof T];
			}
		}
		return merged;
	}

	protected mergePopulate(populate: string[] = []) {
		const repoOptions: string[] = this.repoOptions.populate ?? [];
		const merged: string[] = Array.from(new Set([...repoOptions, ...populate]));
		return merged;
	}

	// overload 1
	protected transformFilter<TWhere>(
		this: MongooseRepositoryImpl<T>,
		where: { id: string } & TWhere,
		queryOptions?: QueryOptions<T>,
	): { _id: string } & Omit<TWhere, 'id'>;
	// overload 2
	protected transformFilter<TWhere>(
		this: MongooseRepositoryImpl<T>,
		where: { id?: string } & TWhere,
		queryOptions?: QueryOptions<T>,
	): { _id?: string } & Omit<TWhere, 'id'>;
	// implementation
	protected transformFilter<TWhere>(
		this: MongooseRepositoryImpl<T>,
		where: { id?: string } & TWhere,
		queryOptions?: QueryOptions<T>,
	): { _id?: string } & Omit<TWhere, 'id'> {
		const repoOptions: QuerriableType<T> =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('filter'))
			) ?
				{}
			:	(this.repoOptions.filter ?? {});
		const queryRepoOptions = { ...repoOptions, ...(queryOptions?.customRepoOptions?.filter ?? {}) };
		// shallow copy cuz we have to delete key later
		const defaultFindOptions = { ...queryRepoOptions };

		// since the fields cannot be undefined
		// we can safely use undefined as an overwrite to find all regardless of the value of the field
		const cleanedFindOptions = { ...where };
		if (queryRepoOptions)
			for (const key of Object.keys(where)) {
				if (where[key] === undefined) {
					delete defaultFindOptions[key];
					delete cleanedFindOptions[key];
				}
			}

		const transformed = {
			...defaultFindOptions,
			...cleanedFindOptions,
			...(where.id && { _id: where.id }),
		};

		delete transformed.id;
		return transformed;
	}

	protected transformSort(
		queryOptions?: QueryOptions<T>,
	): { [key: string]: SortOrder } | undefined {
		const repoOptions: SortOptions<T> =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('sort'))
			) ?
				{}
			:	(this.repoOptions.sort ?? {});
		const queryRepoOptions: SortOptions<T> = queryOptions?.customRepoOptions?.sort ?? {};
		const transformed: SortOptions<T> = {};
		for (const key of Object.keys(queryRepoOptions)) {
			transformed[key] = queryRepoOptions[key as keyof T];
		}
		for (const key of Object.keys(repoOptions)) {
			if (!(key in transformed)) {
				transformed[key] = repoOptions[key as keyof T];
			}
		}

		return transformed as { [key: string]: SortOrder } | undefined;
	}

	protected transformPopulate(queryOptions?: QueryOptions<T>): PopulateOptions[] {
		const repoOptions: string[] =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('populate'))
			) ?
				[]
			:	(this.repoOptions.populate ?? []);
		const queryRepoOptions = queryOptions?.customRepoOptions?.populate ?? [];
		const merged: string[] = Array.from(new Set([...repoOptions, ...queryRepoOptions]));
		/** string transformation, appending  'Populated' postfix to values
		 * (.eg userId.deletedBy => userIdPopulated.deletedByPopulated)*/
		merged.forEach((v, i) =>
			v.endsWith('_') ?
				(merged[i] = v.slice(0, -1))
			:	(merged[i] = v
					.split('.')
					.map(vsegment => vsegment + 'Populated')
					.join('.')),
		);
		const transformed: PopulateOptions[] = merged.map(p => buildPopulateObject(p));
		return transformed;
	}
	//#endregion

	//#region MAIN
	async createSoft(data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const populateOptions = this.transformPopulate(queryOptions);
		const createdEntity = new this.entityModel(data);
		const savedEntity = await createdEntity.save({ session });
		const populatedEntity = await savedEntity.populate(populateOptions);
		return populatedEntity.toObject();
	}

	async create(data: CreateType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>> {
		return this.createSoft(data, queryOptions);
	}

	async upsert(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const populateOptions = this.transformPopulate(queryOptions);
		const upsertedEntity = (
			await this.entityModel
				.findOneAndUpdate(filterOptions, data, {
					new: true,
					runValidators: true,
					upsert: true,
				})
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		if (!upsertedEntity) throw new EntityNotFound(this.entityClass);
		return upsertedEntity;
	}

	async update(
		id: string,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const filterOptions = { id } as QuerriableType<T>;
		return this.findOneByAndUpdate(filterOptions, data, queryOptions);
	}

	async delete(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>> {
		const filterOptions = { id } as QuerriableType<T>;
		return this.findOneByAndDelete(filterOptions, queryOptions);
	}

	async findOneById(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T> | null> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter({ id }, queryOptions);
		const populateOptions = this.transformPopulate(queryOptions);
		const foundEntity = (
			await this.entityModel
				.findOne(filterOptions)
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneByIdOrFail(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>> {
		const foundEntity = await this.findOneById(id, queryOptions);
		if (!foundEntity) throw new EntityNotFound(this.entityClass);
		return foundEntity;
	}

	async findOneBy(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T> | null> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const populateOptions = this.transformPopulate(queryOptions);
		const foundEntity = (
			await this.entityModel
				.findOne(filterOptions)
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneByOrFail(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const foundEntity = await this.findOneBy(where, queryOptions);
		if (!foundEntity) throw new EntityNotFound(this.entityClass);
		return foundEntity;
	}

	async findOneByAndUpdate(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const populateOptions = this.transformPopulate(queryOptions);
		const updatedEntity = (
			await this.entityModel
				.findOneAndUpdate(filterOptions, data, {
					new: true,
					runValidators: true,
				})
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		if (!updatedEntity) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
	}

	async findOneByAndDelete(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const populateOptions = this.transformPopulate(queryOptions);
		const deletedEntity = (
			await this.entityModel
				.findOneAndDelete(filterOptions)
				.populate(populateOptions)
				.session(session)
				.exec()
		)?.toObject();
		if (!deletedEntity) throw new EntityNotFound(this.entityClass);
		return deletedEntity;
	}

	async find(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<Populated<T>[]> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const sortOptions = this.transformSort(queryOptions);
		const skipOptions = queryOptions?.skip || 0;
		const limitOptions = queryOptions?.limit || 0;
		const populateOptions = this.transformPopulate(queryOptions);
		const foundEntities: Populated<T>[] = [];
		const query = this.entityModel
			.find(filterOptions)
			.sort(sortOptions)
			.skip(skipOptions)
			.limit(limitOptions)
			.session(session)
			.populate(populateOptions);
		const cursor = query.cursor();
		for await (const doc of cursor) {
			foundEntities.push(doc.toObject());
		}
		return foundEntities;
	}

	async count(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<number> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const count = this.entityModel.countDocuments(filterOptions).session(session);
		return count;
	}

	async exists(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<boolean> {
		const session = CustomRequestCtx.get().req.db.mongoose.session || null;
		const filterOptions = this.transformFilter(where, queryOptions);
		const existing = await this.entityModel.exists(filterOptions).session(session);
		return existing ? true : false;
	}
	//#endregion
}

//#region SOFTDELETE REPO
/**
 * @see
 * T extending ISoftDeletable means it has a narrower typing so we can't just assign as is.
 * Unfortunately there's no options in TS to set the lowerbound so we have to introduce this workaround.
 * Well it warns us enough when using the class but warns us too much when defining the methods,
 * so feel free to use type assertion inside the methods.
 * */
export class MongooseSoftDeleteRepositoryImpl<
		T extends ISoftDeletableEntity & LowerBound<T, ISoftDeletableEntity>,
	>
	extends MongooseRepositoryImpl<T>
	implements ISoftDeleteBaseRepository<T>
{
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
		repoOptions: RepoOptions<T> = {},
	) {
		/**
		 * this is a sub class so the field initializers came after super is called,
		 * calling super here would just merge with the options in the baseclass.
		 *
		 * init base -> set repoOptions for THIS subclass -> merge
		 */
		super(entityModel, entityClass);
		this.repoOptions = {
			filter: { deleted: false } as QuerriableType<T>,
			populate: ['deletedBy'],
		};
		this.mergeRepoOptions(repoOptions);
	}

	/** [NPLA] not finished as this does not soft delete related entities */
	/**
	 * [NPLAU - 26/07/25] I will consider this finished, as there is no way to properly and safely
	 * cascade using mongoose or mongo. I believe doing cascade manually inside service might be
	 * my best bet.
	 */
	async softDelete(
		id: string,
		deletedBy: string | null = null,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		// Still have to assert type, but dw we already have a check above
		const filterOptions = { id } as QuerriableType<T>;
		return this.findOneByAndSoftDelete(filterOptions, deletedBy, queryOptions);
	}

	/** [NPLA] not finished as this does not soft delete related entities */
	/**
	 * [NPLAU - 26/07/25] I will consider this finished, as there is no way to properly and safely
	 * cascade using mongoose or mongo. I believe doing cascade manually inside service might be
	 * my best bet.
	 */
	async findOneByAndSoftDelete(
		where: QuerriableType<T>,
		deletedBy: string | null = null,
		queryOptions?: QueryOptions<T>,
	): Promise<Populated<T>> {
		const updatedData = {
			deleted: true,
			deletedBy,
			deletedAt: new Date(),
		} as Partial<T>;
		return this.findOneByAndUpdate(where, updatedData, queryOptions);
	}

	/** [NPLA] not finished as this does not recover related entities */
	/**
	 * [NPLAU - 26/07/25] I will consider this finished, as there is no way to properly and safely
	 * cascade using mongoose or mongo. I believe doing cascade manually inside service might be
	 * my best bet.
	 */
	async restore(id: string, queryOptions?: QueryOptions<T>): Promise<Populated<T>> {
		return this.update(id, { deleted: false, deletedBy: null, deletedAt: null } as Partial<T>, {
			...queryOptions,
			doNotUseRepoOptions: ['filter'],
		});
	}
}
//#endregion
