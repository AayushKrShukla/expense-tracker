import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User Email Address',
    example: 'test@mail.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 character long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Aayush Shukla',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(3, { message: 'Password must be at least 6 character long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  name: string;
}
