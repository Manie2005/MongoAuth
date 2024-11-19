import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/login-admin.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Ensure you have a JWT guard for admin tasks
// import { CreateAdminDto } from './dto/create-admin.dto';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Seed Admin Account
  @Post('seed')
  async seedAdmin(): Promise<{ message: string }> {
    await this.adminService.seedAdmin();
    return { message: 'Admin account seeded successfully.' };
  }

  // Admin Login
  @Post('login')
  async login(@Body() adminLoginDto: AdminLoginDto): Promise<{ accessToken: string }> {
    return this.adminService.adminLogin(adminLoginDto);
  }

  // Get All Users
  @UseGuards(JwtAuthGuard) // Protect route with JWT
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // Block User
  @UseGuards(JwtAuthGuard) // Protect route with JWT
  @Patch('block/:userId')
  async blockUser(@Param('userId') userId: string) {
    const user = await this.adminService.blockUser(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'User successfully blocked.', user };
  }
}
