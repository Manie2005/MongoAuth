import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from 'src/user/schemas/admin.schema';
import { User } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { AdminLoginDto } from './dto/login-admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // Import JwtService

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService, // Inject JwtService
  ) {}

  // Create & Seed Admin
  async seedAdmin(): Promise<void> {
    try {
      // Check if an admin already exists
      const existingAdmin = await this.adminModel.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log('Admin already exists');
        return;
      }

      // Hash admin password
      const hashedPassword = await bcrypt.hash('adminpassword', 12);

      // Create the admin
      const adminData: Partial<Admin> = {
        firstname: 'Manie',
        lastname: 'Samuel',
        email: 'maniesamuel24@gmail.com',
        password: `C@keMania2024`,
        role: 'admin',
      };

      const admin = new this.adminModel(adminData);
      await admin.save();

      console.log('Admin seeded successfully.');
    } catch (error) {
      console.error(`Error seeding admin: ${error.message}`);
      throw new InternalServerErrorException('Failed to seed admin');
    }
  }

  // Admin Login
  async adminLogin(adminLoginDto: AdminLoginDto): Promise<any> {
    const { email, password } = adminLoginDto;
    const admin = await this.adminModel.findOne({ email, role: 'admin' }); // Ensure role is admin
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ userId: admin._id, role: admin.role });
    return { accessToken: token };
  }

  // Find Admin by Id
  async FindById(id: string): Promise<Admin> {
    return this.adminModel.findById(id).exec();
  }

  // Fetch all users for admin
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Block a user
  async blockUser(userId: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(userId, { blocked: true }, { new: true }).exec();
  }
}
