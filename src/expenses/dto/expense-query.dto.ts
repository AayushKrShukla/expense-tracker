import {
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ExpenseQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2025-08-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2025-08-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'uuid-category-id',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by wallet ID',
    example: 'uuid-wallet-id',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Wallet ID must be a valid UUID' })
  walletId?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum amount',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min amount must be a number' })
  @Min(0, { message: 'Min amount must be non-negative' })
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum amount',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max amount must be a number' })
  @Min(0, { message: 'Max amount must be non-negative' })
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Search in description (case-insensitive)',
    example: 'restaurant',
  })
  @IsOptional()
  @IsString({ message: 'Description search must be a string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'date',
    enum: ['date', 'amount', 'description', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'amount' | 'description' | 'createdAt' = 'date';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
