import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signup(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.userService.login(loginDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otpCode } = verifyOtpDto;
    try {
      const isVerified = await this.userService.verifyOtp(verifyOtpDto);
      if (isVerified) {
        return { message: 'User verified successfully' };
      } else {
        throw new BadRequestException('Invalid or expired OTP');
      }
    } catch (error) {
      return { message: 'User not verified', error: error.message };
    }
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.userService.forgotPassword(forgotPasswordDto.email); // `email` will now work correctly
  }
}
