import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ExpenseResponseDto,
  ExpenseSummaryResponseDto,
  PaginatedExpenseResponseDto,
} from './dto/expense-response.dto';
import { request } from 'http';
import type { RequestWithUser } from 'src/common/interfaces/request-user-interface';
import { ExpenseQueryDto } from './dto/expense-query.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({
    description: 'Create a new expense',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid expense data or insufficient balance',
  })
  @ApiResponse({ status: 404, description: 'Wallet or category not found' })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Request() request: RequestWithUser,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(createExpenseDto, request.user.id);
  }

  @Get()
  @ApiOperation({ description: 'Get expenses with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of expenses',
    type: PaginatedExpenseResponseDto,
  })
  findAll(
    @Query() query: ExpenseQueryDto,
    @Request() request: RequestWithUser,
  ) {
    return this.expensesService.findAll(query, request.user.id);
  }

  @Get('summary')
  @ApiOperation({
    description: 'Get expense summary and analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense summary with analytics',
    type: ExpenseSummaryResponseDto,
  })
  async summary(@Request() request: RequestWithUser) {
    return this.expensesService.getSummary(request.user.id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get a specific expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense details',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: RequestWithUser,
  ) {
    return this.expensesService.findOne(id, request.user.id);
  }

  @Patch(':id')
  @ApiOperation({ description: 'Update an expense' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfullt',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() request: RequestWithUser,
  ) {
    return this.expensesService.update(id, updateExpenseDto, request.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Delete an expense' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: RequestWithUser,
  ) {
    return this.expensesService.remove(id, request.user.id);
  }
}
