import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  type: PostType;
  title: string;
  content?: string;
}
