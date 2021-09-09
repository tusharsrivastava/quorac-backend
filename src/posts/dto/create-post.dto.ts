import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { CreateSubCategoryDto } from 'src/categories/dto/create-subcategory.dto';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  type: PostType;
  title: string;
  content?: string;
  category?: CreateCategoryDto;
  subcategories?: CreateSubCategoryDto[];
}
