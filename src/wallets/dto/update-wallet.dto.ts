import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateWalletDto } from './create-wallet.dto';
import { IsOptional } from 'class-validator';

export class UpdateWalletDto extends PartialType(
  OmitType(CreateWalletDto, ['type'] as const),
) {
  @ApiPropertyOptional({
    description: 'Updated name of wallet',
    example: 'Updated Bank Account Name',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description:
      'Updated Balance (use carefully - normally updated through expenses)',
  })
  @IsOptional()
  balance?: number;
}
