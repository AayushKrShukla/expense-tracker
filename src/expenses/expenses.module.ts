import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [WalletsModule, CategoriesModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
