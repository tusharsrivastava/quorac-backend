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
    try {
      e.entity.category.followers = Math.max(
        0,
        e.entity.category.followers + 1,
      );
      if (isNaN(e.entity.category.followers)) {
        e.entity.category.followers = 1;
      }
    } catch {
      e.entity.category.followers = 1;
    }
    const repo = e.connection.getRepository(Category);
    await repo.save(e.entity.category);
  }

  async beforeRemove(e: RemoveEvent<CategoryFollower>) {
    console.log('Before Insert');
    try {
      e.entity.category.followers = Math.max(
        0,
        e.entity.category.followers - 1,
      );
      if (isNaN(e.entity.category.followers)) {
        e.entity.category.followers = 0;
      }
    } catch {
      e.entity.category.followers = 0;
    }
    const repo = e.connection.getRepository(Category);
    await repo.save(e.entity.category);
  }
}
