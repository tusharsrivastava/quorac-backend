import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  type: PostType;
  content: string;
}
