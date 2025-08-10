import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const { name, description, color } = createCategoryDto;

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `You already have a cateogry with the name "${name}"`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        description: description || null,
        color,
        userId,
      },
    });
    return category;
  }

  async findAll(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      userId: category.userId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      expenseCount: category._count.expenses,
    }));
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      userId: category.userId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      expenseCount: category._count.expenses,
    };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    const existingCategory = await this.findOne(id, userId);

    const { name, description, color } = updateCategoryDto;

    if (name && name !== existingCategory.name) {
      const conflictingCategory = await this.prisma.category.findFirst({
        where: {
          userId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (conflictingCategory) {
        throw new ConflictException(
          `Cateogry with name "${name}" already exists`,
        );
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && {
          description: description || null,
        }),
        ...(color && { color }),
      },
    });

    return updatedCategory;
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    if (category.expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because it has ${category.expenseCount} expense(s). Delete the expenses first`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: `Cateogry "${category.name}" has deleted successfully`,
    };
  }

  async getSummary(userId: string) {
    const categories = await this.findAll(userId);

    const topCategoriesData = await this.prisma.category.findMany({
      where: { userId },
      include: {
        expenses: {
          select: { amount: true },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        expenses: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topCategories = topCategoriesData
      .filter((category) => category._count.expenses > 0)
      .map((category) => ({
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          userId: category.userId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
        expenseCount: category._count.expenses,
        totalAmount: category.expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        ),
      }));

    return {
      totalCategories: categories.length,
      categoriesWithExpenses: categories.filter((cat) => cat.expenseCount > 0)
        .length,
      categoriesWithoutExpenses: categories.filter(
        (cat) => cat.expenseCount === 0,
      ).length,
      topCategories,
    };
  }

  async validateCategoryExists(id: string, userId: string) {
    try {
      await this.findOne(id, userId);
      return true;
    } catch {
      return false;
    }
  }
}
