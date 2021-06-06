import { injectedConsts } from 'src/global.constants';
import { Connection } from 'typeorm';
import { UserActivity } from './entities/activity.entity';
import { User } from './entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';
export const USER_ACTIVITY_REPOSITORY = 'USER_ACTIVITY_REPOSITORY';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(User),
    inject: [injectedConsts.DATABASE_CONNECTION],
  },
  {
    provide: USER_ACTIVITY_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.getRepository(UserActivity),
    inject: [injectedConsts.DATABASE_CONNECTION],
  },
];
