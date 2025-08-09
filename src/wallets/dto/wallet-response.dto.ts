import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from '../enums/wallet-type.enum';

export class WalletResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'SBI Bank Account' })
  name: string;

  @ApiProperty({ example: '2025-08-10T12:00:00' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-10T12:00:00' })
  updatedAt: Date;

  @ApiProperty({ required: false, example: 25 })
  expenseCount?: number;
}

export class WalletSummaryResponseDto {
  @ApiProperty({ example: 25000 })
  totalBalance: number;

  @ApiProperty({
    example: {
      BANK: { count: 1, totalBalance: 15000, wallets: [] },
      CASH: { count: 1, totalBalance: 15000, wallets: [] },
      UPI: { count: 1, totalBalance: 15000, wallets: [] },
    },
  })
  walletsByType: {
    [key in WalletType]: {
      count: number;
      totalBalance: number;
      wallets: WalletResponseDto[];
    };
  };
}
