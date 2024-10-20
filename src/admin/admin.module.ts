import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/user/schemas/admin.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
    imports:[MongooseModule.forFeature([{name: Admin.name, schema:AdminSchema}]),
    JwtModule.register({ secret: 'JWT_SECRET', signOptions: { expiresIn: '1h' }})
 ],
 providers:[AdminService],
 controllers:[AdminController],
})
export class AdminModule {}
