import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryFollower } from './entities/category.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    @InjectRepository(CategoryFollower)
    private readonly categoryFollowerRepo: Repository<CategoryFollower>,
    @Inject(REQUEST)
    private readonly req: Request,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  get currentUser() {
    try {
      const { username } = (this.req as any).user;
      return this.userService.findOneByUsername(username);
    } catch (e) {
      return this.authService.AnonymousUser;
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.repo.create(createCategoryDto);
    return await this.repo.save(category);
  }

  async findAll() {
    const user = await this.currentUser;

    const followedCategories = await this.categoryFollowerRepo.find({
      relations: ['category'],
      where: { user: user },
    });
    const categories = await this.repo.find({
      order: {
        id: 'ASC',
      },
    });

    return categories.map((cat) => {
      const isFollowed = followedCategories.find(
        (f) => f.category.id === cat.id,
      );
      return {
        ...cat,
        isFollowed,
      };
    });
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

  async toggleFollow(id: number) {
    const user = await this.currentUser;

    const categoryFollwer = await this.categoryFollowerRepo.findOne({
      category: {
        id,
      },
      user: user,
    });

    let isFollowed = false;

    if (categoryFollwer) {
      await this.categoryFollowerRepo.remove(categoryFollwer);
    } else {
      const categoryFollwer = this.categoryFollowerRepo.create({
        category: { id },
        user: user,
      });
      await this.categoryFollowerRepo.save(categoryFollwer);
      isFollowed = true;
    }
    const category = await this.repo.findOne(id);
    return {
      ...category,
      isFollowed,
    };
  }
}
