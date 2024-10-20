// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UserModule } from './user/user.module';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { join } from 'path';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule } from '@nestjs/config';
// @Module({
//   imports: [
//    ConfigModule.forRoot({
//     isGlobal:true,
//    }),     
// MongooseModule.forRoot(process.env.MONGO_URI)
//     ,UserModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {
//   constructor() {
//     console.log('MongoDb Connected Successfully');
//   }
// }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PaymentService } from './payment/payment.service';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
@Module({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),  
       MongooseModule.forRoot(process.env.MONGO_URI),
      MailerModule.forRoot({
        transport: {
          host: process.env.EMAIL_HOST, 
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
          },
        
        },
        defaults: {
          from: `"No Reply" <${process.env.EMAIL_USER}>`, // Default sender email
        },
        template: {
          dir: join(__dirname, 'templates'), //optional
          adapter: new HandlebarsAdapter(), //optional
          options: {
            strict: true,
          },
        },
      }),
      UserModule,
      AdminModule
    ],
    controllers:[AppController, AdminController],
    providers: [AppService, PaymentService, AdminService],
  })
  export class AppModule {}





