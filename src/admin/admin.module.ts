import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin, AdminSchema } from 'src/user/schemas/admin.schema';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema },    { name: User.name, schema: UserSchema },
    ]), // Register Admin model
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JWT_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // Export AdminService for use in other modules
})
export class AdminModule {}
