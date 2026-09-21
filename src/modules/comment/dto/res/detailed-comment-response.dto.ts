import { Exclude, Expose } from 'class-transformer';

import { ReactionCount } from '@modules/reaction/repositories';

import { ResponseCommentDto } from './comment-response.dto';

@Exclude()
export class ResponseCommentDetailedDto extends ResponseCommentDto {
	@Expose({ name: 'counts' })
	reactionCounts!: Pick<ReactionCount, 'counts'>;
}
