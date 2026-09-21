import { OmitType } from '@nestjs/mapped-types';

import { CreateSharePostDto } from './create-post.dto';

export class SharePostDto extends OmitType(CreateSharePostDto, ['parentPostId']) {}
