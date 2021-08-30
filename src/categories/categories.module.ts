import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory])],
  controllers: [SubCategoriesController, CategoriesController],
  providers: [CategoriesService, SubCategoriesService],
  exports: [CategoriesService, SubCategoriesService],
})
export class CategoriesModule {}
