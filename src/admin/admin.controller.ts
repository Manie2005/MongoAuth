import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from 'src/user/dto/login-user.dto';
import { Error } from 'mongoose';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
//Admin Login
@Post('login')
  async login(@Body() loginDto: LoginDto) {
    const admin = await this.adminService.findByEmail(loginDto.email);
    if(!admin){
        throw new Error('Invalid Credentials');
            }

        }











}
