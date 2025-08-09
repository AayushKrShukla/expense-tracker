import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { WalletType } from '../enums/wallet-type.enum';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Name of the wallet',
    example: 'SBI',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Wallet name must be a string' })
  @MinLength(2, { message: 'Wallet name must be at least 2 character long' })
  @MaxLength(50, { message: 'Wallet name must not exceed 50 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Type of wallet',
    enum: WalletType,
    example: WalletType.BANK,
  })
  @IsEnum(WalletType, {
    message: `Wallet must be one of: ${Object.values(WalletType).join(',')}`,
  })
  type: WalletType;

  @ApiProperty({
    description: 'Initial Balance for the wallet',
    example: 1000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Balance must be a number' })
  @Min(0, { message: 'Balance cannot be negative' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  balance?: number = 0;
}
