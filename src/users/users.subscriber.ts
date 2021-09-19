import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { User, UserFollower } from './entities/user.entity';

@EventSubscriber()
export class UserFollowSubscriber
  implements EntitySubscriberInterface<UserFollower>
{
  listenTo() {
    return UserFollower;
  }

  async afterInsert(e: InsertEvent<UserFollower>) {
    console.log('After Insert');
    const conn = e.connection;
    try {
      await conn
        .createQueryBuilder()
        .update(User)
        .set({
          followersCount: () => '"user"."followersCount" + 1',
        })
        .where('"user"."id" = :id', { id: e.entity.followed.id })
        .execute();
      await conn
        .createQueryBuilder()
        .update(User)
        .set({
          followingCount: () => '"user"."followingCount" + 1',
        })
        .where('"user"."id" = :id', { id: e.entity.user.id })
        .execute();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async beforeRemove(e: RemoveEvent<UserFollower>) {
    console.log('Before Insert');
    const conn = e.connection;
    console.log(e);
    try {
      let rawQueryFollowed = '"user"."followersCount" - 1';
      const rawQueryUser = '"user"."followingCount" - 1';

      if (e.entity.followed.followersCount == 0) {
        rawQueryFollowed = '0';
      }
      if (e.entity.user.followingCount == 0) {
        rawQueryFollowed = '0';
      }
      await conn
        .createQueryBuilder()
        .update(User)
        .set({
          followersCount: () => rawQueryFollowed,
        })
        .where('"user"."id" = :id', { id: e.entity.followed.id })
        .execute();
      await conn
        .createQueryBuilder()
        .update(User)
        .set({
          followingCount: () => rawQueryUser,
        })
        .where('"user"."id" = :id', { id: e.entity.user.id })
        .execute();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
