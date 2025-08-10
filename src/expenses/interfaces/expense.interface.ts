export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Date;
  walletId: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithRelations extends Expense {
  wallet: {
    id: string;
    name: string;
    type: string;
  };
  category: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  thisMonth: {
    totalExpenses: number;
    totalAmount: number;
  };
  thisWeek: {
    totalExpenses: number;
    totalAmount: number;
  };
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
  }>;
  byWallet: Array<{
    walletId: string;
    walletName: string;
    walletType: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
  }>;
}

export interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  walletId?: string;
  minAmount?: string;
  maxAmount?: string;
  description?: string;
}

export interface PaginatedExpenses {
  expenses: ExpenseWithRelations[];
  paginations: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ExpenseWhereFilter {
  userId: string;
  date: {
    gte?: Date;
    lte?: Date;
  };
  categoryId: string;

  walletId: string;
  amount: {
    gte?: number;
    lte?: number;
  };
  description: {
    contains: string;
    mode: 'insensitive';
  };
}
