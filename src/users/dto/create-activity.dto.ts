import { UserActivityType } from '../entities/activity.entity';
import { User } from '../entities/user.entity';

export class CreateUserActivityDto {
  id?: string;
  activity: UserActivityType;
  for: User;
}
