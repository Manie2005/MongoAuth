import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin,AdminSchema } from 'src/user/schemas/admin.schema'; // Ensure this is correct
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]), // Register AdminModel
     JwtModule.register({ secret: 'JWT_SECRET', signOptions: { expiresIn: '1h' }})
 
],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // Export it if needed in other modules
})
export class AdminModule {}

