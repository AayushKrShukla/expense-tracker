import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    await this.createDefaultUserData(user.id);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
      message: 'User Created Successfully',
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: { id: string; email: string; name?: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      message: 'Login Successfull',
    };
  }

  private async createDefaultUserData(userId: string) {
    await this.prisma.wallet.createMany({
      data: [
        { name: 'SBI', type: 'BANK', userId },
        { name: 'Wallet', type: 'CASH', userId },
        { name: 'Lite', type: 'UPI', userId },
      ],
    });

    await this.prisma.category.createMany({
      data: [
        {
          name: 'Food',
          description: 'Online and Offline Food and Dining',
          userId,
        },
        {
          name: 'Fuel',
          description: 'Petrol Cost',
          userId,
        },
        {
          name: 'Clothes and Shoes',
          description: 'Clothes and Shoes',
          userId,
        },
        {
          name: 'Entertainment',
          description: 'Movies and Games',
          userId,
        },
        {
          name: 'Alcoholic Drinks',
          description: 'Beer, Whiskey etc..',
          userId,
        },
      ],
    });
  }
}
