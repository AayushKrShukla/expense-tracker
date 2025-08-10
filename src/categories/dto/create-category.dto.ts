import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Food & Dining',
    minLength: 2,
    maxLength: 30,
  })
  @IsString({ message: 'Cateogory name must be a string' })
  @MinLength(2, {
    message: 'Category name must be at least two character long',
  })
  @MaxLength(30, { message: 'Category name must not exceed 30 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Restaurants, groceries, food delivery',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @MaxLength(100, { message: 'Description must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Hex color code for the category',
    example: '#FF6B35',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color code (e.g., #FF6B35 or #F63)',
  })
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  color: string;
}
