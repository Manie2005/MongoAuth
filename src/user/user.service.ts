import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Generate a random OTP upon signup
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Configure email transporter using Nodemailer
  private async sendEmail(email: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'immanueliniobong@gmail.com',  
        pass: 'jicvrgsgyoyutrna',            
      },
      secure: true,                   
            host: 'smtp.gmail.com',         
      port: 465,                      
    }); 
      
    // try {
    //   await transporter.sendMail({
    //     from: 'immanueliniobong@gmail.com',  // Sender's email
    //     to: email,                           // Recipient's email
    //     subject: subject,
    //     text: text,
    //   });
    //   console.log('Email sent successfully');
    // } catch (error) {
    //   console.error(`Failed to send email: ${error.message}`);
    //   throw new Error('Failed to send email. Please try again later.');
    // }
  }

  // Signup method
  async signup(createUserDto: CreateUserDto): Promise<any> {
    const { firstname, lastname, email, phonenumber, address, password } = createUserDto;

    // Check if the user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate OTP and expiration time
    const otpCode = this.generateOtp();
    const otpexpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user document
    const newUser = new this.userModel({
      firstname,
      lastname,
      email,
      phonenumber,
      address,
      password: hashedPassword,
      otpCode,
      otpexpires,
    });

    // Save the new user and send the OTP email
    try {
      await newUser.save();
      console.log('Sending OTP email');
      await this.sendEmail(
        email,
        'Your OTP Code',
        `Your OTP code is: ${otpCode}. It is valid for 10 minutes.`,
      );
      return { message: 'OTP sent to your email. Please verify your account.' };
    } catch (error) {
      console.error(`Error saving user: ${error.message}`);
      throw new InternalServerErrorException('Error creating account. Please try again later.');
    }
  }

  // Verify OTP method
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    const { email, otpCode } = verifyOtpDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid email');
    } 

    // Clear OTP fields after successful verification
    user.otpCode = undefined;
    user.otpexpires = undefined;

    try {
      await user.save();
      return { message: 'Account successfully verified' };
    } catch (error) {
      console.error(`Error verifying user: ${error.message}`);
      throw new InternalServerErrorException('Error verifying account. Please try again later.');
    }

    
  }
  //User login Method
  async login(loginDto: LoginDto): Promise<any> { //the toke here allows JWT to be returned 
    const { email, password } = loginDto;

    // Find user by  their email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

   
  }

}
