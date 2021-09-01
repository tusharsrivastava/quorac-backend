import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
  listenTo() {
    return Comment;
  }

  afterInsert(event: InsertEvent<Comment>) {
    console.log(
      `A new comment has been inserted with following data: ${event.entity}`,
    );

    const newComment = event.entity;
    const repo = event.manager.getRepository(Post);
    newComment.post.numComments++;
    repo.save(newComment.post);
  }
}
