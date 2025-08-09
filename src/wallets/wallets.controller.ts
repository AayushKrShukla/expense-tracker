import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  WalletResponseDto,
  WalletSummaryResponseDto,
} from './dto/wallet-response.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-user-interface';
import { WalletSummary } from './interfaces/wallet.interface';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Wallet name already exists' })
  @ApiResponse({ status: 400, description: 'Invalid wallet data' })
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @Request() req: RequestWithUser,
  ): Promise<WalletResponseDto> {
    console.log('user', req.user);

    const wallet = await this.walletsService.create(
      createWalletDto,
      req.user.id,
    );
    return wallet;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get wallet summary with balances by type' })
  @ApiResponse({
    status: 200,
    description: 'Wallet Summary',
    type: WalletSummaryResponseDto,
  })
  getSummary(@Request() req: RequestWithUser): Promise<WalletSummary> {
    return this.walletsService.getSummary(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wallets for the user' })
  @ApiResponse({
    status: 200,
    description: 'List of user wallets',
    type: [WalletResponseDto],
  })
  findAll(@Request() req: RequestWithUser) {
    return this.walletsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get a specific wallet by id' })
  @ApiParam({ name: 'id', description: 'Wallet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet details',
    type: WalletResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.walletsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet updated successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 409, description: 'Wallet name already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @Request() req: RequestWithUser,
  ) {
    return this.walletsService.update(id, updateWalletDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet UUID' })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete wallet with expenses',
  })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.walletsService.remove(id, req.user.id);
  }
}
