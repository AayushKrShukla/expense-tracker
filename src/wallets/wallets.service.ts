import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/database/prisma.service';
import {
  Wallet,
  WalletSummary,
  WalletWithExpenseCount,
} from './interfaces/wallet.interface';
import { WalletType } from '@prisma/client';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createWalletDto: CreateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const { name, type, balance = 0 } = createWalletDto;

    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingWallet) {
      throw new ConflictException(`You already have a wallet named "${name}"`);
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        name,
        type,
        balance,
        userId,
      },
    });
    return wallet;
  }

  async findAll(userId: string): Promise<WalletWithExpenseCount[]> {
    const wallets = await this.prisma.wallet.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });

    return wallets.map((wallet) => ({
      ...{ ...wallet, _count: undefined },
      expenseCount: wallet._count.expenses,
    }));
  }

  async findOne(id: string, userId: string): Promise<WalletWithExpenseCount> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found!');
    }

    return {
      ...{ ...wallet, _count: undefined },
      expenseCount: wallet._count.expenses,
    };
  }

  async update(
    id: string,
    updateWalletDto: UpdateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const existingWallet = await this.findOne(id, userId);

    const { name, balance } = updateWalletDto;

    if (name && name !== existingWallet.name) {
      const conflictingWallet = await this.prisma.wallet.findFirst({
        where: {
          userId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });
      if (conflictingWallet) {
        throw new ConflictException(
          `You already have a wallet named "${name}"`,
        );
      }
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(balance !== undefined && { balance }),
      },
    });

    return updatedWallet;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const wallet = await this.findOne(id, userId);

    if (wallet.expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete wallet "${wallet.name}" because it has ${wallet.expenseCount} expense(s). Delete the expenses first`,
      );
    }

    await this.prisma.wallet.delete({
      where: { id },
    });
    return {
      message: `Wallet "${wallet.name}" has been deleted successfully`,
    };
  }

  async getSummary(userId: string): Promise<WalletSummary> {
    const wallets = await this.findAll(userId);

    const summary: WalletSummary = {
      totalBalance: 0,
      walletsByType: {
        [WalletType.BANK]: { count: 0, totalBalance: 0, wallets: [] },
        [WalletType.CASH]: { count: 0, totalBalance: 0, wallets: [] },
        [WalletType.UPI]: { count: 0, totalBalance: 0, wallets: [] },
      },
    };

    wallets.forEach((wallet) => {
      summary.totalBalance += wallet.balance;
      summary.walletsByType[wallet.type].count++;
      summary.walletsByType[wallet.type].totalBalance += wallet.balance;
      summary.walletsByType[wallet.type].wallets.push(wallet);
    });

    return summary;
  }

  async updateBalance(
    id: string,
    amount: number,
    userId: string,
    operation: 'increment' | 'decrement' = 'decrement',
  ) {
    const wallet = await this.findOne(id, userId);

    if (operation === 'decrement' && wallet.type !== WalletType.CASH) {
      if (wallet.balance < amount) {
        throw new BadRequestException(
          `Insufficient balance in ${wallet.name}. Available ₹${wallet.balance}, Required: ₹${amount}`,
        );
      }
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        balance: {
          [operation]: amount,
        },
      },
    });

    return updatedWallet;
  }
}
