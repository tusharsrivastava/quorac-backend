import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { CommentAction } from './entities/comment.action.entity';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { ActionType } from './post.enums';

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

@EventSubscriber()
export class CommentActionSubscriber
  implements EntitySubscriberInterface<CommentAction>
{
  listenTo() {
    return CommentAction;
  }

  afterInsert(event: InsertEvent<CommentAction>) {
    const newAction = event.entity;
    if (newAction.actionType === ActionType.UPVOTE) {
      newAction.comment.upvotes = Math.max(
        0,
        (newAction.comment.upvotes || 0) + 1,
      );
    } else if (newAction.actionType === ActionType.DOWNVOTE) {
      newAction.comment.downvotes = Math.max(
        0,
        (newAction.comment.downvotes || 0) + 1,
      );
    }
    const repo = event.manager.getRepository(Comment);
    repo.save(newAction.comment);
  }

  beforeRemove(event: RemoveEvent<CommentAction>) {
    const deletedAction = event.entity;
    if (deletedAction.actionType === ActionType.UPVOTE) {
      deletedAction.comment.upvotes = Math.max(
        0,
        (deletedAction.comment.upvotes || 0) - 1,
      );
    } else if (deletedAction.actionType === ActionType.DOWNVOTE) {
      deletedAction.comment.downvotes = Math.max(
        0,
        (deletedAction.comment.downvotes || 0) - 1,
      );
    }

    const repo = event.manager.getRepository(Comment);
    repo.save(deletedAction.comment);
  }
}
