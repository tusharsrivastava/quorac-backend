import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, CategoryFollower } from './entities/category.entity';
import { SubCategory } from './entities/subcategory.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, SubCategory, CategoryFollower]),
    UsersModule,
    AuthModule,
  ],
  controllers: [SubCategoriesController, CategoriesController],
  providers: [CategoriesService, SubCategoriesService],
  exports: [CategoriesService, SubCategoriesService],
})
export class CategoriesModule {}
