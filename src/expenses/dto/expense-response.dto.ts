import { ApiProperty } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 1500.5 })
  amount: number;

  @ApiProperty({ example: 'Lunch at restaurant' })
  description: string;

  @ApiProperty({ example: '2025-08-10T00:00:00Z' })
  date: Date;

  @ApiProperty({ example: 'uuid-wallet-id' })
  walletId: string;

  @ApiProperty({ example: 'uuid-category-id' })
  categoryId: string;

  @ApiProperty({ example: '2025-08-10T08:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-10T08:30:00Z' })
  updatedAt: Date;

  @ApiProperty({
    required: false,
    example: {
      id: 'uuid-wallet-id',
      name: 'Cash Wallet',
      type: 'CASH',
    },
  })
  wallet?: {
    id: string;
    name: string;
    type: string;
  };

  @ApiProperty({
    required: false,
    example: {
      id: 'uuid-category-id',
      name: 'Food & Dining',
      color: '#FF6B35',
    },
  })
  category?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export class PaginatedExpenseResponseDto {
  @ApiProperty({ type: [ExpenseResponseDto] })
  expenses: ExpenseResponseDto[];

  @ApiProperty({
    example: {
      total: 150,
      page: 1,
      limit: 20,
      totalPages: 8,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ExpenseSummaryResponseDto {
  @ApiProperty({ example: 45 })
  totalExpenses: number;

  @ApiProperty({ example: 67500.25 })
  totalAmount: number;

  @ApiProperty({ example: 1500.01 })
  averageExpense: number;

  @ApiProperty({
    example: {
      totalExpenses: 12,
      totalAmount: 18500.5,
    },
  })
  thisMonth: {
    totalExpenses: number;
    totalAmount: number;
  };

  @ApiProperty({
    example: {
      totalExpenses: 3,
      totalAmount: 4500.0,
    },
  })
  thisWeek: {
    totalExpenses: number;
    totalAmount: number;
  };

  @ApiProperty({
    example: [
      {
        categoryId: 'uuid',
        categoryName: 'Food & Dining',
        categoryColor: '#FF6B35',
        totalAmount: 25000,
        expenseCount: 15,
        percentage: 37.04,
      },
    ],
  })
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
  }>;

  @ApiProperty({
    example: [
      {
        walletId: 'uuid',
        walletName: 'Cash Wallet',
        walletType: 'CASH',
        totalAmount: 30000,
        expenseCount: 20,
        percentage: 44.44,
      },
    ],
  })
  byWallet: Array<{
    walletId: string;
    walletName: string;
    walletType: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
  }>;
}
