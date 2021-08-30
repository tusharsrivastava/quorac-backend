import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostType } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.service.create(createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('myposts')
  findMyPosts() {
    return this.service.findByUser();
  }

  @Get('type/:type')
  findByType(@Param('type') type: PostType) {
    return this.service.findByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/associated')
  findAssociated(@Param('id') id: string) {
    return this.service.findAssociated(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.service.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/comments')
  getComments(@Param('id') postId: string) {
    return this.service.findComments(postId);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') postId: string,
    @Body() commentDto: CreateCommentDto,
  ) {
    return this.service.addComment(postId, commentDto);
  }
}
