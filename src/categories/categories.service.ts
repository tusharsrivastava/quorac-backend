import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.repo.create(createCategoryDto);
    return await this.repo.save(category);
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

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    let category = await this.repo.findOne(id);
    category = this.repo.merge(category, updateCategoryDto);
    return await this.repo.save(category);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}
