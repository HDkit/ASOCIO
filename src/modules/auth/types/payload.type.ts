import { z } from 'zod/v4';

import { Role } from '@common/enums';

export const subSchema = z.object({
	id: z.string(),
	roles: z.array(z.enum(Role)),
	hasFinishedSetup: z.boolean(),
});

export type Sub = z.infer<typeof subSchema>;

export interface Payload {
	username?: string;
	sub: Sub;
}

export const createPayload = ({ username, ...sub }: { username?: string } & Sub) => {
	return { username, sub: subSchema.parse(sub) };
};
