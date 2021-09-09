import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { In, Not, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostType } from './entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { AuthService } from 'src/auth/auth.service';
import slugify from 'slugify';
import { ActionType } from './post.enums';
import { PostAction } from './entities/post.action.entity';
import { CommentAction } from './entities/comment.action.entity';

@Injectable({ scope: Scope.REQUEST })
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    @InjectRepository(PostAction)
    private readonly pActionRepo: Repository<PostAction>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentAction)
    private readonly cActionRepo: Repository<CommentAction>,
    @Inject(REQUEST)
    private readonly req: Request,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  get currentUser() {
    try {
      const { id } = (this.req as any).user;
      return this.userService.findOneById(id);
    } catch (e) {
      return this.authService.AnonymousUser;
    }
  }

  async create(createPostDto: CreatePostDto) {
    const { subcategories, ...obj } = createPostDto;
    obj['subcategories'] = subcategories.map((e: any) => {
      if (e.id === null) {
        e.key = slugify(e.name);
        e.category = {
          ...obj.category,
        };
      }
      return e;
    });
    const post = this.repo.create(obj);
    post.createdBy = await this.currentUser;

    return this.repo.save(post);
  }

  async addPostActions(posts: Post[]) {
    const currentUser = await this.currentUser;
    // Find all post actions by this user for these posts
    const actions = await this.pActionRepo.find({
      where: {
        user: currentUser,
        post: In(posts.map((e) => e.id)),
      },
    });
    // map all posts to an object and update hasUpvoted and hasDownvoted
    const actionsMap = actions.reduce((acc, curr) => {
      acc[`${curr.post.id}:${curr.actionType}`] = curr;
      return acc;
    }, {});
    return posts.map((e) => {
      e.hasUpvoted = actionsMap[`${e.id}:${ActionType.UPVOTE}`] !== undefined;
      e.hasDownvoted =
        actionsMap[`${e.id}:${ActionType.DOWNVOTE}`] !== undefined;
      return e;
    });
  }

  async addCommentActions(comments: Comment[]) {
    const currentUser = await this.currentUser;
    // Find all post actions by this user for these posts
    const actions = await this.cActionRepo.find({
      where: {
        user: currentUser,
        comment: In(comments.map((e) => e.id)),
      },
    });
    // map all posts to an object and update hasUpvoted and hasDownvoted
    const actionsMap = actions.reduce((acc, curr) => {
      acc[`${curr.comment.id}:${curr.actionType}`] = curr;
      return acc;
    }, {});
    return comments.map((e) => {
      e.hasUpvoted = actionsMap[`${e.id}:${ActionType.UPVOTE}`] !== undefined;
      e.hasDownvoted =
        actionsMap[`${e.id}:${ActionType.DOWNVOTE}`] !== undefined;
      return e;
    });
  }

  async findAll({ page = 1, limit = 50 } = {}) {
    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
      count: total,
    };
  }

  async findTrending({ page = 1, limit = 50 } = {}) {
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
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
      count: total,
    };
  }

  async findTrendingByType(type: PostType, { page = 1, limit = 50 } = {}) {
    let whereClause: any = {
      type,
    };

    if (type === PostType.ANSWER) {
      whereClause = [
        {
          type: PostType.ANSWER,
        },
        {
          type: PostType.QUESTION,
          numAssociatedPosts: 0,
        },
      ];
    }

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        numLikes: 'DESC',
        upvotes: 'DESC',
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
      count: total,
    };
  }

  async findOne(id: string) {
    return await this.repo.findOneOrFail(id, {
      relations: ['parent', 'createdBy', 'category', 'subcategories'],
    });
  }

  async findAssociated(postId: string, { page = 1, limit = 50 } = {}) {
    const post = await this.findOne(postId);

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: {
        parent: post,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
      count: total,
    };
  }

  async findByType(
    type: PostType,
    { page = 1, limit = 50, category = null, subcategories = [] } = {},
  ) {
    let whereClause: any = {
      type,
    };

    if (type === PostType.ANSWER) {
      whereClause = [
        {
          type: PostType.ANSWER,
        },
        {
          type: PostType.QUESTION,
          numAssociatedPosts: 0,
        },
      ];
    }

    if (category !== null) {
      if (Array.isArray(whereClause)) {
        whereClause = whereClause.map((clause) => ({
          ...clause,
          category: {
            key: category,
          },
        }));
      } else {
        whereClause['category'] = {
          key: category,
        };
      }
    }

    // if (subcategories.length > 0) {
    //   if (Array.isArray(whereClause)) {
    //     whereClause = whereClause.map((clause) => ({
    //       ...clause,
    //       subcategories: {
    //         key: In(subcategories),
    //       },
    //     }));
    //   } else {
    //     whereClause['subcategories'] = {
    //       key: In(subcategories),
    //     };
    //   }
    // }

    console.log(whereClause);

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
      count: total,
    };
  }

  async findByUser({ page = 1, limit = 50 } = {}) {
    const user = await this.currentUser;

    const [result, total] = await this.repo.findAndCount({
      relations: ['parent'],
      where: { createdBy: user },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addPostActions(result),
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
      title: post.title,
      content: createPostDto.content,
      type: PostType.ANSWER,
      parent: post,
      category: post.category,
      subcategories: post.subcategories,
    });

    answer.createdBy = await this.currentUser;

    return await this.repo.save(answer);
  }

  async togglePostAction(postId: string, action: ActionType) {
    const currentUser = await this.currentUser;
    const existing = await this.pActionRepo.findOne({
      post: {
        id: postId,
      },
      user: currentUser,
      actionType: action,
    });
    if (existing) {
      await this.pActionRepo.remove(existing);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_actions, count] = await this.pActionRepo.findAndCount({
        post: { id: postId },
        actionType: action,
      });
      return { action: false, count: count };
    } else {
      const newAction = this.pActionRepo.create({
        post: {
          id: postId,
        },
        user: currentUser,
        actionType: action,
      });
      await this.pActionRepo.save(newAction);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_actions, count] = await this.pActionRepo.findAndCount({
        post: { id: postId },
        actionType: action,
      });
      return { action: true, count: count };
    }
  }

  async toggleCommentAction(commentId: string, action: ActionType) {
    const currentUser = await this.currentUser;
    const existing = await this.cActionRepo.findOne({
      comment: {
        id: commentId,
      },
      user: currentUser,
      actionType: action,
    });
    if (existing) {
      await this.cActionRepo.remove(existing);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_actions, count] = await this.cActionRepo.findAndCount({
        comment: { id: commentId },
        actionType: action,
      });
      return { action: false, count: count };
    } else {
      const newAction = this.cActionRepo.create({
        comment: {
          id: commentId,
        },
        user: currentUser,
        actionType: action,
      });
      await this.cActionRepo.save(newAction);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_actions, count] = await this.cActionRepo.findAndCount({
        comment: { id: commentId },
        actionType: action,
      });
      return { action: true, count: count };
    }
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

  async findComments(postId: string, { page = 1, limit = 50 } = {}) {
    const post = await this.findOne(postId);

    const [result, total] = await this.commentRepo.findAndCount({
      where: {
        post,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: await this.addCommentActions(result),
      count: total,
    };
  }
}
