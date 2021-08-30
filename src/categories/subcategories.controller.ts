import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { SubCategoriesService } from './subcategories.service';

@Controller('categories')
export class SubCategoriesController {
  constructor(private readonly service: SubCategoriesService) {}

  @Get('subcategories')
  findAll() {
    return this.service.findAll();
  }

  @Post('subcategories/bulk')
  async createBlukAll(@Body() createSubCategoriesDto: CreateSubCategoryDto[]) {
    return await Promise.all(
      createSubCategoriesDto.map((dto) => {
        return this.service.create(null, dto);
      }),
    );
  }

  @Post(':id/subcategories')
  create(
    @Param('id') categoryId: string,
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ) {
    return this.service.create(+categoryId, createSubCategoryDto);
  }

  @Post(':id/subcategories/bulk')
  async createBluk(
    @Param('id') categoryId: string,
    @Body() createSubCategoriesDto: CreateSubCategoryDto[],
  ) {
    return await Promise.all(
      createSubCategoriesDto.map((dto) => {
        return this.service.create(+categoryId, dto);
      }),
    );
  }

  @Get(':id/subcategories')
  findByCategory(@Param('id') id: string, @Query('isKey') isKey: boolean) {
    if (isKey) {
      return this.service.findByCategoryKey(id);
    }
    return this.service.findByCategory(+id);
  }

  @Get(':catId/subcategories/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':catId/subcategories/:id')
  update(
    @Param('catId') categoryId: string,
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.service.update(+categoryId, +id, updateSubCategoryDto);
  }

  @Delete(':catId/subcategories/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
