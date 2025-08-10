import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'Food & Dining' })
  name: string;

  @ApiProperty({
    example: 'Restaurants, groceries, food delivery',
    required: false,
  })
  description: string | null;

  @ApiProperty({ example: '#FF6B35' })
  color: string | null;

  @ApiProperty({ example: '2025-08-10T03:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-10T03:30:00Z' })
  updatedAt: Date;

  @ApiProperty({ required: false, example: 15 })
  expenseCount?: number;
}

export class CategorySummaryResponseDto {
  @ApiProperty({ example: 6 })
  totalCategories: number;

  @ApiProperty({ example: 4 })
  categoriesWithExpenses: number;

  @ApiProperty({ example: 2 })
  categoriesWithoutExpenses: number;

  @ApiProperty({
    example: [
      {
        category: { id: 'uuid', name: 'Food & Dining', color: '#FF6B35' },
        expenseCount: 25,
        totalAmount: 15000,
      },
    ],
  })
  topCategories: Array<{
    category: CategoryResponseDto;
    expenseCount: number;
    totalAmount: number;
  }>;
}
