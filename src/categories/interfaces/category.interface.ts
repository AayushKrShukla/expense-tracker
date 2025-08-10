export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithExpenseCount extends Category {
  expenseCount: number;
}

export interface CategorySummary {
  totalCategories: number;
  categoriesWithExpenses: number;
  categoriesWithoutExpenses: number;
  topCategories: Array<{
    category: Category;
    expenseCount: number;
    totalAmount: number;
  }>;
}
