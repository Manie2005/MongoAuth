import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminService } from './admin/admin.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //since admin wont be signing up for use//
  //seed his credentials//
//   const adminService = app.get(AdminService);
//   const existingAdmin = await adminService.findByEmail();
//   if(!existingAdmin){
// const hashedPassword
//   }
app.useGlobalPipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted:false}));
  await app.listen(3000);
}
bootstrap();
