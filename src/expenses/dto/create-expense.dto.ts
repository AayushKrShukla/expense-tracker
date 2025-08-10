import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Amount of expense',
    example: 1500.01,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  amount: number;

  @ApiProperty({
    description: 'Description of the expense',
    example: 'Ordered food from zomato',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Description must be a string' })
  @MinLength(2, { message: 'Description must be at least 2 characters long' })
  @MaxLength(100, { message: 'Description must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description: string;

  @ApiProperty({
    description: 'Date of the expense (ISO string or YYYY-MM-DD)',
    example: '2025-08-10',
  })
  @IsDateString(
    {},
    { message: 'Date must be a valid date string (YYYY-MM-DD or ISO format)' },
  )
  date: string;

  @ApiProperty({
    description: 'Id of the wallet to deduct from',
    example: 'uuid-wallet-id',
  })
  @IsUUID(4, { message: 'Wallet ID must be a valid UUID' })
  walletId: string;

  @ApiProperty({
    description: 'ID of the expense category',
    example: 'uuid-category-id',
  })
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId: string;
}
