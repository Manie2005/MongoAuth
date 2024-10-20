import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from 'src/user/schemas/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    adminService:any;
constructor(
    @InjectModel(Admin.name)private adminModel:Model<Admin> ){}
    //Find Email For Admin Login//
    async findByEmail(email:string):Promise<Admin>{
return this.adminModel.findOne({email}).exec();
    }





}
