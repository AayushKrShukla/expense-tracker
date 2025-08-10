import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/database/prisma.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { CategoriesService } from 'src/categories/categories.service';
import {
  ExpenseSummary,
  ExpenseWhereFilter,
  ExpenseWithRelations,
  PaginatedExpenses,
} from './interfaces/expense.interface';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { CategoryResponseDto } from 'src/categories/dto/category-response.dto';
import { WalletWithExpenseCount } from 'src/wallets/interfaces/wallet.interface';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<ExpenseWithRelations> {
    const { amount, categoryId, date, description, walletId } =
      createExpenseDto;

    const [wallet, _] = await Promise.all([
      this.walletService.findOne(walletId, userId),
      this.categoriesService.findOne(categoryId, userId),
    ]);

    console.log(description.length, description);

    if (wallet.type !== 'CASH' && wallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance in ${wallet.name}. Availabe ${wallet.balance}. Required: ${amount}`,
      );
    }

    const result = this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          amount,
          description,
          date: new Date(date),
          walletId,
          categoryId,
          userId,
        },
        include: {
          wallet: {
            select: { id: true, name: true, type: true },
          },
          category: {
            select: { id: true, name: true, color: true },
          },
        },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return expense;
    });

    return result;
  }

  async findAll(
    query: ExpenseQueryDto,
    userId: string,
  ): Promise<PaginatedExpenses> {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      categoryId,
      walletId,
      minAmount,
      maxAmount,
      description,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const where: Partial<ExpenseWhereFilter> = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.gte = new Date(endDate);
    }

    if (categoryId) where.categoryId = categoryId;
    if (walletId) where.walletId = walletId;

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const [total, expenses] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        include: {
          wallet: {
            select: { id: true, name: true, type: true },
          },
          category: {
            select: { id: true, name: true, color: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      expenses,
      paginations: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<ExpenseWithRelations> {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: {
        wallet: {
          select: { id: true, name: true, type: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    const existingExpense = await this.findOne(id, userId);

    const { amount, date, walletId, categoryId, description } =
      updateExpenseDto;

    const validationPromise: Promise<
      WalletWithExpenseCount | CategoryResponseDto
    >[] = [];

    if (walletId && walletId !== existingExpense.walletId) {
      validationPromise.push(this.walletService.findOne(walletId, userId));
    }
    if (categoryId && categoryId !== existingExpense.categoryId) {
      validationPromise.push(
        this.categoriesService.findOne(categoryId, userId),
      );
    }

    if (validationPromise.length > 0) {
      await Promise.all(validationPromise);
    }

    const oldAmount = existingExpense.amount;
    const newAmount = amount ?? oldAmount;
    const oldWalletId = existingExpense.walletId;
    const newWalletId = walletId ?? oldWalletId;
    const amountDifference = newAmount - oldAmount;

    console.log(oldAmount, newAmount, amountDifference);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount }),
          ...(description !== undefined && { description }),
          ...(date && { date: new Date(date) }),
          ...(walletId && { walletId }),
          ...(categoryId && { categoryId }),
        },
        include: {
          wallet: {
            select: { id: true, name: true, type: true },
          },
          category: {
            select: { id: true, name: true, color: true },
          },
        },
      });

      if (oldWalletId === newWalletId) {
        if (amountDifference !== 0) {
          await tx.wallet.update({
            where: { id: walletId },
            data: {
              balance: {
                decrement: amountDifference,
              },
            },
          });
        }
      } else {
        console.log('will this run?', oldWalletId, newWalletId);

        await Promise.all([
          tx.wallet.update({
            where: { id: oldWalletId },
            data: {
              balance: {
                increment: oldAmount,
              },
            },
          }),
          tx.wallet.update({
            where: { id: newWalletId },
            data: {
              balance: {
                decrement: newAmount,
              },
            },
          }),
        ]);
      }
      return updatedExpense;
    });

    return result;
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: expense.walletId },
        data: {
          balance: {
            increment: expense.amount,
          },
        },
      });

      await tx.expense.delete({
        where: { id },
      });
    });
    return `Expense "${expense.description}" has been deleted and wallet balance has been restored`;
  }

  async getSummary(userId: string): Promise<ExpenseSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [totalStats, monthStats, weekStats] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: startOfWeek } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    const categoryBreakdown = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const categoryDetails = await this.prisma.category.findMany({
      where: {
        id: { in: categoryBreakdown.map((item) => item.categoryId) },
        userId,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const categoryMap = new Map(categoryDetails.map((cat) => [cat.id, cat]));

    const walletBreakdown = await this.prisma.expense.groupBy({
      by: ['walletId'],
      where: { userId },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const walletDetails = await this.prisma.wallet.findMany({
      where: {
        id: {
          in: walletBreakdown.map((wallet) => wallet.walletId),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    const walletMap = new Map(
      walletDetails.map((wallet) => [wallet.id, wallet]),
    );

    const totalAmount = totalStats._sum.amount || 0;

    return {
      totalExpenses: totalStats._count._all,
      totalAmount,
      averageExpense: totalStats._avg.amount || 0,
      thisMonth: {
        totalExpenses: monthStats._count._all,
        totalAmount: monthStats._sum.amount || 0,
      },
      thisWeek: {
        totalExpenses: weekStats._count._all,
        totalAmount: weekStats._sum.amount || 0,
      },
      byCategory: categoryBreakdown
        .map((item) => {
          const category = categoryMap.get(item.categoryId);
          const amount = item._sum.amount || 0;
          return {
            categoryId: item.categoryId,
            categoryName: category?.name || 'Unknown',
            categoryColor: category?.color || '#000000',
            totalAmount: amount,
            expenseCount: item._count._all,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount),
      byWallet: walletBreakdown
        .map((item) => {
          const wallet = walletMap.get(item.walletId);
          const amount = item._sum.amount || 0;
          return {
            walletId: item.walletId,
            walletName: wallet?.name || 'Unknown',
            walletType: wallet?.type || 'UNKNOWN',
            totalAmount: amount,
            expenseCount: item._count._all,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount),
    };
  }
}
