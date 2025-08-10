import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'Updated name of the category',
    example: 'Updated Food and dining',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the category',
    example: 'Updated description for food expenses',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated Hex Color code',
    example: '#4ECDC4',
  })
  @IsOptional()
  color?: string;
}
