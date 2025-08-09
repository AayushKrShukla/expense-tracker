import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { Public } from './decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      const counts = {
        users: await this.prisma.user.count(),
        wallets: await this.prisma.wallet.count(),
        categories: await this.prisma.category.count(),
        expenses: await this.prisma.expense.count(),
      };

      return {
        status: 'healthy',
        database: 'connected',
        message: 'Expense tracker database is ready',
        counts,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: errorMessage,
      };
    }
  }
}
