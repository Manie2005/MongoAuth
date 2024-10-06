import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login-user.dto';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
require ('dotenv').config();
@Injectable()
export class UserService {
  userService: any;
  validateUser(email: string, password: string) {
     throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService, // Inject MailerService
  ) {}

  // Generate a random OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }


  // Send email using MailerService
  private async sendEmail(email: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Make sure this is correctly set in your .env
        pass: process.env.EMAIL_PASS,  // Make sure this is correctly set in your .env
      },
      secure: true,                   // Use TLS
      host: 'smtp.gmail.com',
      port: 465,                      // Port for secure SMTP
    });
  
    if (!email || !subject || !text) {
      throw new Error('Email, subject, or text is missing');
    }
  
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,  // Sender's email from .env
        to: email,                     // Recipient's email
        subject: subject,
        text: text,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      throw new Error('Failed to send email. Please try again later.');
    }
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
        `Your OTP code is: ${otpCode}. Hello : ${firstname} ,please note your OTP is valid for only 10 minutes.`,
      );
      return { message: 'OTP sent to your email. Please verify your account within 10 minutes.' };
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

    // Check if OTP is valid and not expired
    if (user.otpCode !== otpCode || new Date(user.otpexpires).getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    return{
      message:'OTP verified succesfully',
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

  // User login method
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    console.log('Logged In Successfully');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and return JWT token
    const token = this.jwtService.sign({ userId: user._id });
    return { accessToken: token };
  }
  // Forgot password functionality (send password reset email)
 
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('No user found with this email.');
    }

    const token = this.jwtService.sign({ email }, { expiresIn: '1h' }); // Generate token valid for 1 hour
  }
}
