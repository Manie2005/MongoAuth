import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  UnauthorizedException 
} from '@nestjs/common';
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
require('dotenv').config();

@Injectable()
export class UserService {
  userService: any;

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
        user: process.env.EMAIL_USER,  // Ensure this is set in your .env
        pass: process.env.EMAIL_PASS,  // Ensure this is set in your .env
      },
      secure: true,
      host: 'smtp.gmail.com',
      port: 465,
    });

    if (!email || !subject || !text) {
      throw new Error('Email, subject, or text is missing');
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
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

    console.log('Email:', email);
    console.log('Password:', password);

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    // Check if the user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate OTP and expiration time
    const otpCode = this.generateOtp();
    const otpexpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Hash the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
        `Your OTP code is: ${otpCode}. Hello : ${firstname}, please note your OTP is valid for only 10 minutes.`,
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

  // Forgot password functionality
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User with this email is not found');
    }

    // Generate a reset token using JWT
    const resetToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: '1h' },
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1-hour expiration
    await user.save();

    const resetLink = `http://example.com/reset-password?token=${resetToken}`;

    try {
      await this.sendEmail(
        user.email,
        'Reset Password Request',
        `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      );
      console.log('Reset password email sent successfully');
    } catch (error) {
      console.error(`Failed to send password reset email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }

  // Reset password functionality
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log('Password successfully reset');
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
