import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  EducationInfo,
  Hobby,
  Language,
  Profile,
  School,
  WorkInfo,
} from './entities/profile.entity';
import { User, UserFollower } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserFollower,
      Profile,
      School,
      Company,
      Language,
      Hobby,
      WorkInfo,
      EducationInfo,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
