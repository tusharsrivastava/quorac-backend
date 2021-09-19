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
import { AllowAnonymous } from 'src/auth/auth.decorators';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.service.create(createCategoryDto);
  }

  @Post('bulk')
  async createBluk(@Body() createCategoriesDto: CreateCategoryDto[]) {
    return await Promise.all(
      createCategoriesDto.map((dto) => {
        return this.service.create(dto);
      }),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @AllowAnonymous()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.service.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post(':id/follow/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(@Param('id') id: string) {
    return await this.service.toggleFollow(+id);
  }
}
