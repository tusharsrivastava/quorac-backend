import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Post, PostType } from './entities/post.entity';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post;
  }

  afterInsert(event: InsertEvent<Post>) {
    console.log(
      `A new post has been inserted with following data: ${event.entity}`,
    );

    const newPost = event.entity;
    if (newPost.type === PostType.ANSWER) {
      // Increment numAssociatedPosts of the parent question
      newPost.parent.numAssociatedPosts++;
      // Save
      const repo = event.manager.getRepository(Post);
      repo.save(newPost.parent);
    }
  }
}
