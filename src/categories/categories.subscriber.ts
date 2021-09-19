import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Category, CategoryFollower } from './entities/category.entity';

@EventSubscriber()
export class CategoryFollowSubscriber
  implements EntitySubscriberInterface<CategoryFollower>
{
  listenTo() {
    return CategoryFollower;
  }

  async afterInsert(e: InsertEvent<CategoryFollower>) {
    console.log('After Insert');
    const conn = e.connection;
    await conn
      .createQueryBuilder()
      .update(Category)
      .set({
        followers: () => 'followers + 1',
      })
      .where('category.id = :id', { id: e.entity.category.id })
      .execute();
  }

  async beforeRemove(e: RemoveEvent<CategoryFollower>) {
    console.log('Before Insert');
    const conn = e.connection;
    let rawQuery = 'followers - 1';
    if (e.entity.category.followers == 0) {
      rawQuery = '0';
    }
    await conn
      .createQueryBuilder()
      .update(Category)
      .set({
        followers: () => rawQuery,
      })
      .where('category.id = :id', { id: e.entity.category.id })
      .execute();
  }
}
