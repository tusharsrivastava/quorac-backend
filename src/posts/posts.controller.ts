import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostType } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AllowAnonymous } from 'src/auth/auth.decorators';
import { ActionType } from './post.enums';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @AllowAnonymous()
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.service.create(createPostDto);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.findAll({ page, limit });
  }

  @Get('trending')
  findTrending(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.findTrending({ page, limit });
  }

  @Get('trending/:type')
  findTrendingByType(
    @Param('type') type: PostType,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.findTrendingByType(type, { page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Get('myposts')
  findMyPosts(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.findByUser({ page, limit });
  }

  @Get('type/:type')
  findByType(
    @Param('type') type: PostType,
    @Query('category') category: string,
    @Query('subcategories') subcategories: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.findByType(type, {
      page,
      limit,
      category,
      subcategories: subcategories ? subcategories.split(',') : [],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @AllowAnonymous()
  @Post(':id/answers')
  addAnswer(@Param('id') id: string, @Body() createPostDto: CreatePostDto) {
    return this.service.addAnswer(id, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upvote')
  async upvotePost(@Param('id') postId) {
    return await this.service.togglePostAction(postId, ActionType.UPVOTE);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/downvote')
  async downvotePost(@Param('id') postId) {
    return await this.service.togglePostAction(postId, ActionType.DOWNVOTE);
  }

  @Get(':id/associated')
  findAssociated(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.findAssociated(id, { page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.service.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/comments')
  getComments(
    @Param('id') postId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.findComments(postId, { page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id') postId: string,
    @Body() commentDto: CreateCommentDto,
  ) {
    return this.service.addComment(postId, commentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':pid/comments/:id/upvote')
  async upvoteComment(@Param('id') commentId) {
    return await this.service.toggleCommentAction(commentId, ActionType.UPVOTE);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':pid/comments/:id/downvote')
  async downvoteComment(@Param('id') commentId) {
    return await this.service.toggleCommentAction(
      commentId,
      ActionType.DOWNVOTE,
    );
  }
}
