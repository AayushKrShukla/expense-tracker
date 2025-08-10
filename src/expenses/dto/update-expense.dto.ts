import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';
import { IsOptional } from 'class-validator';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @ApiPropertyOptional({
    description: 'Updated amount of the expense',
    example: 2000.75,
  })
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Updated lunch expense',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated date',
    example: '2025-08-11',
  })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    description: 'Updated wallet ID',
    example: 'new-wallet-uuid',
  })
  @IsOptional()
  walletId?: string;

  @ApiPropertyOptional({
    description: 'Updated category ID',
    example: 'new-category-uuid',
  })
  @IsOptional()
  categoryId?: string;
}
