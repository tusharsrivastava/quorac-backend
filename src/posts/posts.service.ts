import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { MoreThan, Not, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostType } from './entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable({ scope: Scope.REQUEST })
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @Inject(REQUEST)
    private readonly req: Request,
    private readonly userService: UsersService,
  ) {}

  get currentUser() {
    const { id } = (this.req as any).user;

    return this.userService.findOneById(id);
  }

  async create(createPostDto: CreatePostDto) {
    const post = this.repo.create(createPostDto);
    post.createdBy = await this.currentUser;

    return this.repo.save(post);
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: result,
      count: total,
    };
  }

  async findTrending({ page = 1, limit = 10 } = {}) {
    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: {
        type: Not(PostType.QUESTION),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        numLikes: 'DESC',
        upvotes: 'DESC',
      },
    });

    return {
      data: result,
      count: total,
    };
  }

  async findTrendingByType(type: PostType, { page = 1, limit = 10 } = {}) {
    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: {
        type,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        numLikes: 'DESC',
        upvotes: 'DESC',
      },
    });

    return {
      data: result,
      count: total,
    };
  }

  async findOne(id: string) {
    return await this.repo.findOneOrFail(id, {
      relations: ['parent', 'createdBy'],
    });
  }

  async findAssociated(postId: string, { page = 1, limit = 10 } = {}) {
    const post = await this.findOne(postId);

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: {
        parent: post,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: result,
      count: total,
    };
  }

  async findByType(type: PostType, { page = 1, limit = 10 } = {}) {
    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: { type },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: result,
      count: total,
    };
  }

  async findByUser({ page = 1, limit = 10 } = {}) {
    const user = await this.currentUser;

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: { createdBy: user },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: result,
      count: total,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    let post = await this.findOne(id);
    post = this.repo.merge(post, updatePostDto);
    return await this.repo.save(post);
  }

  async remove(id: string) {
    return await this.repo.delete(id);
  }

  async addAnswer(postId: string, createPostDto: CreatePostDto) {
    const post = await this.findOne(postId);

    if (post.type !== PostType.QUESTION) {
      throw new Error('Post is not a question');
    }

    const answer = this.repo.create({
      content: createPostDto.content,
      type: PostType.ANSWER,
      parent: post,
    });

    answer.createdBy = await this.currentUser;

    return await this.repo.save(answer);
  }

  async addComment(postId: string, createCommentDto: CreateCommentDto) {
    const post = await this.findOne(postId);
    const comment = this.commentRepo.create({
      content: createCommentDto.content,
      post: post,
    });

    comment.postedBy = await this.currentUser;

    return await this.commentRepo.save(comment);
  }

  async findComments(postId: string, { page = 1, limit = 10 } = {}) {
    const post = await this.findOne(postId);

    const [result, total] = await this.commentRepo.findAndCount({
      where: {
        post,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: result,
      count: total,
    };
  }
}
