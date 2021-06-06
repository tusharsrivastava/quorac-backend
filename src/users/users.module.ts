import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { UsersController } from './users.controller';
import { userProviders } from './users.provider';
import { UsersService } from './users.service';

@Module({
  imports: [DbModule],
  providers: [UsersService, ...userProviders],
  controllers: [UsersController],
  exports: [UsersService, ...userProviders],
})
export class UsersModule {}
