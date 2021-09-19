import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { SubCategory } from './entities/subcategory.entity';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly repo: Repository<SubCategory>,
  ) {}

  async create(catId: number, createSubCategoryDto: CreateSubCategoryDto) {
    let { categoryId } = createSubCategoryDto;
    if (catId > 0) {
      categoryId = catId;
    } else if (categoryId === undefined || categoryId === null) {
      throw new Error('CategoryId is required');
    }

    const subcategory = this.repo.create({
      name: createSubCategoryDto.name,
      key: createSubCategoryDto.key,
      category: {
        id: categoryId,
      },
    });

    return await this.repo.save(subcategory);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    return await this.repo.findOneOrFail(id);
  }

  async findOneByKey(key: string) {
    return await this.repo.findOneOrFail({ key });
  }

  async findByCategory(categoryId: number) {
    return await this.repo.find({
      where: { category: { id: categoryId } },
    });
  }

  async findByCategoryKey(categoryKey: string) {
    return await this.repo.find({
      where: { category: { key: categoryKey } },
    });
  }

  async findManyByKeys(keys: string[]) {
    return await this.repo.find({
      where: { key: In(keys) },
    });
  }

  async update(
    categoryId: number,
    id: number,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    let subcategory = await this.repo.findOne(id);
    const { ...rest } = updateSubCategoryDto;
    if (categoryId) {
      rest['category'] = { id: categoryId };
    }
    subcategory = this.repo.merge(subcategory, rest);
    return await this.repo.save(subcategory);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}
