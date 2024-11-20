import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret', // You can also use ConfigService here
      signOptions: { expiresIn: '1h' }, // You can adjust the expiration time
    }),
  ],
  providers: [JwtStrategy, AdminService],
})
export class AuthModule {}
