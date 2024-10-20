import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminService } from './admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //since admin wont be signing up for use//
  //seed his credentials//
//   const adminService = app.get(AdminService);
//   const existingAdmin = await adminService.findByEmail();
//   if(!existingAdmin){
// const hashedPassword
//   }

  await app.listen(3000);
}
bootstrap();
