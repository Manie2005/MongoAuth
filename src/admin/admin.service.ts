import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from 'src/user/schemas/admin.schema';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AdminService {
    adminService:any;
    userModel: any;
constructor(
@InjectModel(Admin.name)private readonly adminModel:Model<Admin> ){}
   //Create & Seed Admin//
async createAdmin(adminData:Partial<Admin>):Promise<Admin>{
const admin = new this.adminModel(adminData);
return admin.save();
   }
       //Find Email For Admin Login//
async findByEmail(email:string):Promise<Admin>{
return this.adminModel.findOne({email}).exec();
    }
    //Find Admin by Id//
async FindById(id:string):Promise<Admin>{
return this.adminModel.findById({id}).exec();
    }
//Fetch all users for admin//
async getAllUsers():Promise<User[]>{
return this.userModel.find().exec();
}
//Block A user//
async blockUser(userId:string):Promise<User>{
return this.userModel.findByIdAndUpdate(userId, {blocked:true}).exec();
}



}
