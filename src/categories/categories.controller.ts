import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CategoryResponseDto,
  CategorySummaryResponseDto,
} from './dto/category-response.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-user-interface';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category added successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  @ApiResponse({ status: 400, description: 'Invalid Cateogory Data' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() request: RequestWithUser,
  ) {
    return this.categoriesService.create(createCategoryDto, request.user.id);
  }

  @Get()
  @ApiOperation({ description: 'Get all categories for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user categories',
    type: [CategoryResponseDto],
  })
  findAll(@Request() request: RequestWithUser) {
    return this.categoriesService.findAll(request.user.id);
  }

  @Get('summary')
  @ApiOperation({ description: 'Get category summary with usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Category summary',
    type: [CategorySummaryResponseDto],
  })
  getSummary(@Request() request: RequestWithUser) {
    return this.categoriesService.getSummary(request.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiParam({ name: 'id', description: 'Cateogry UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cateogry not found',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: RequestWithUser,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id, request.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() request: RequestWithUser,
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      request.user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with expenses',
  })
  remove(@Param('id') id: string, @Request() request: RequestWithUser) {
    return this.categoriesService.remove(id, request.user.id);
  }
}
