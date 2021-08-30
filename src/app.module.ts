import {
  MiddlewareConsumer,
  Module,
  NestModule,
  // RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
// import { PreauthMiddleware } from './auth/preauth.middleware';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from './app.config';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: AppConfig.validateConfig,
    }),
    TypeOrmModule.forRoot(AppConfig.getTypeOrmConfig()),
    AuthModule,
    UsersModule,
    CategoriesModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(PreauthMiddleware).forRoutes({
    //   path: '*',
    //   method: RequestMethod.ALL,
    // });
  }
}
