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

  async afterInsert(event: InsertEvent<PostAction>) {
    const newAction = event.entity;
    if (newAction.actionType === ActionType.UPVOTE) {
      const conn = event.connection;
      await conn
        .createQueryBuilder()
        .update(Post)
        .set({
          upvotes: () => 'upvotes + 1',
        })
        .where('post.id = :id', { id: newAction.post.id })
        .execute();
      // newAction.post.upvotes = Math.max(0, (newAction.post.upvotes || 0) + 1);
    } else if (newAction.actionType === ActionType.DOWNVOTE) {
      const conn = event.connection;
      await conn
        .createQueryBuilder()
        .update(Post)
        .set({
          downvotes: () => 'downvotes + 1',
        })
        .where('post.id = :id', { id: newAction.post.id })
        .execute();
      // newAction.post.downvotes = Math.max(
      //   0,
      //   (newAction.post.downvotes || 0) + 1,
      // );
    }
    // const repo = event.manager.getRepository(Post);
    // repo.save(newAction.post);
  }

  async beforeRemove(event: RemoveEvent<PostAction>) {
    const deletedAction = event.entity;
    if (deletedAction.actionType === ActionType.UPVOTE) {
      let rawQuery = 'upvotes - 1';
      if (deletedAction.post.upvotes == 0) {
        rawQuery = '0';
      }
      const conn = event.connection;
      await conn
        .createQueryBuilder()
        .update(Post)
        .set({
          upvotes: () => rawQuery,
        })
        .where('post.id = :id', { id: deletedAction.post.id })
        .execute();
      // deletedAction.post.upvotes = Math.max(
      //   0,
      //   (deletedAction.post.upvotes || 0) - 1,
      // );
    } else if (deletedAction.actionType === ActionType.DOWNVOTE) {
      let rawQuery = 'downvotes - 1';
      if (deletedAction.post.upvotes == 0) {
        rawQuery = '0';
      }
      const conn = event.connection;
      await conn
        .createQueryBuilder()
        .update(Post)
        .set({
          downvotes: () => rawQuery,
        })
        .where('post.id = :id', { id: deletedAction.post.id })
        .execute();
      // deletedAction.post.downvotes = Math.max(
      //   0,
      //   (deletedAction.post.downvotes || 0) - 1,
      // );
    }
    // const repo = event.manager.getRepository(Post);
    // repo.save(deletedAction.post);
  }
}
