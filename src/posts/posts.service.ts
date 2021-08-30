import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
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

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: string) {
    return await this.repo.findOneOrFail(id);
  }

  async findAssociated(postId: string) {
    const post = await this.findOne(postId);

    return await this.repo.find({
      where: {
        parent: post,
      },
    });
  }

  async findByType(type: PostType) {
    return await this.repo.find({
      where: { type },
    });
  }

  async findByUser() {
    const user = await this.currentUser;

    return await this.repo.find({
      where: { createdBy: user },
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    let post = await this.findOne(id);
    post = this.repo.merge(post, updatePostDto);
    return await this.repo.save(post);
  }

  async remove(id: string) {
    return await this.repo.delete(id);
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

  async findComments(postId: string) {
    const post = await this.findOne(postId);

    return await this.commentRepo.find({
      where: {
        post,
      },
    });
  }
}
