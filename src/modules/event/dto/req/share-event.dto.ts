import { OmitType } from '@nestjs/mapped-types';

import { CreateEventPostDto } from '@modules/post/dto';

export class ShareEventDto extends OmitType(CreateEventPostDto, ['eventId']) {}
