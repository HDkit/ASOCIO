import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { HydratedDocument, ValidatorProps } from 'mongoose';

import { Populated } from '@common/crud/entities';
import { SoftDeletableEntitySchemaDef } from '@common/crud/entities/mongoose-schema';
import { Role } from '@common/enums';
import { Complete } from '@common/types/utils';
import { nonEmptyAfterCreate, uniqueArrayFieldValidator } from '@common/validators';

import { Level, Status } from '../enums';
import { GoogleLoginInfo, Location, Sport, User } from './user.entity';

@Schema({ _id: false })
export class LocationSubDoc implements Location {
	@Prop({ type: String, index: true })
	province!: string | null;

	@Prop({ type: String, index: true })
	city!: string | null;

	@Prop({ index: true })
	hidden!: boolean;
}

@Schema({ _id: false })
export class SportSubDoc implements Sport {
	@Prop({ type: String, enum: Level })
	level!: Level;

	@Prop()
	name!: string;
}

@Schema({ _id: false })
export class GoogleLoginInfoSubDoc implements GoogleLoginInfo {
	@Prop({ type: String, index: true })
	id!: string | null;
}

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class UserSchemaDef
	extends SoftDeletableEntitySchemaDef
	implements Populated<Complete<User>>
{
	@Prop({ required: true, unique: true, index: 'text' })
	username!: string;

	@Prop({
		type: String,
		validate: {
			validator: nonEmptyAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-empty value`,
		},
	})
	password!: string | null;

	@Prop({ type: [String], enum: Role, default: [Role.SETTING_UP] })
	roles!: Role[];

	@Prop({
		type: String,
		unique: true,
		sparse: true,
		validate: {
			validator: nonEmptyAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-empty value`,
		},
		default: null,
		index: 'text',
	})
	mail!: string | null;

	@Prop({
		type: String,
		index: {
			unique: true,
			partialFilterExpression: { phone: { $type: 'string' } },
		},
		validate: {
			validator: nonEmptyAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-empty value`,
		},
		default: null,
	})
	phone!: string | null;

	@Prop({ type: String, default: null })
	avatarUrl: string | null = null;

	@Prop({
		type: LocationSubDoc,
		default: (): Location => ({
			city: null,
			province: null,
			hidden: false,
		}),
	})
	location!: Location;

	@Prop({
		default: [],
		validate: {
			validator: uniqueArrayFieldValidator<Sport>('name'),
			message: (props: ValidatorProps) => `Each ${props.path} element must have unique name`,
		},
	})
	sports: Sport[] = [];

	@Prop({ type: String, enum: Status, default: Status.OFFlINE })
	status!: Status;

	@Prop({ default: false, index: true })
	hasFinishedSetup: boolean = false;

	@Prop({ type: GoogleLoginInfoSubDoc, default: null })
	googleLoginInfo!: GoogleLoginInfo | null;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaDef);
export type UserDocument = HydratedDocument<User>;

UserSchema.pre('save', function () {
	if (this.isModified('password') && this.password !== null) {
		const hashedPassword = bcrypt.hashSync(this.password, 10);
		this.password = hashedPassword;
	}
});

UserSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
	const password = this.get('password') as string | null;
	if (password) {
		const hashedPassword = bcrypt.hashSync(password, 10);
		this.set('password', hashedPassword);
	}
});
