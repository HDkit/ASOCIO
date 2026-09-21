import { SystemEntity } from '@common/enums';

export const notificationActorTypeEnumValues = [SystemEntity.USER] as const;
export type NotificationActorType = (typeof notificationActorTypeEnumValues)[number];
