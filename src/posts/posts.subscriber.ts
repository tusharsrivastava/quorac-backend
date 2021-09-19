import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { PostAction } from './entities/post.action.entity';
import { Post, PostType } from './entities/post.entity';
import { ActionType } from './post.enums';

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

@EventSubscriber()
export class PostActionSubscriber
  implements EntitySubscriberInterface<PostAction>
{
  listenTo() {
    return PostAction;
  }

  afterInsert(event: InsertEvent<PostAction>) {
    const newAction = event.entity;
    if (newAction.actionType === ActionType.UPVOTE) {
      newAction.post.upvotes = Math.max(0, (newAction.post.upvotes || 0) + 1);
    } else if (newAction.actionType === ActionType.DOWNVOTE) {
      newAction.post.downvotes = Math.max(
        0,
        (newAction.post.downvotes || 0) + 1,
      );
    }
    const repo = event.manager.getRepository(Post);
    repo.save(newAction.post);
  }

  beforeRemove(event: RemoveEvent<PostAction>) {
    const deletedAction = event.entity;
    if (deletedAction.actionType === ActionType.UPVOTE) {
      deletedAction.post.upvotes = Math.max(
        0,
        (deletedAction.post.upvotes || 0) - 1,
      );
    } else if (deletedAction.actionType === ActionType.DOWNVOTE) {
      deletedAction.post.downvotes = Math.max(
        0,
        (deletedAction.post.downvotes || 0) - 1,
      );
    }

    const repo = event.manager.getRepository(Post);
    repo.save(deletedAction.post);
  }
}
