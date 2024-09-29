import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>){}

    async createUser(username:string,email:string,password:string):Promise <User>{
const newUser = new this.userModel({username,email,password});
return newUser.save();
    }
}
