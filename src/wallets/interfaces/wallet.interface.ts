import { WalletType } from '../enums/wallet-type.enum';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletWithExpenseCount extends Wallet {
  expenseCount: number;
}

export interface WalletSummary {
  totalBalance: number;
  walletsByType: {
    [key in WalletType]: {
      count: number;
      totalBalance: number;
      wallets: Wallet[];
    };
  };
}
