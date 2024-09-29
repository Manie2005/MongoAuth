import { Body, Controller ,Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
constructor (private readonly userService:UserService){}

@Post ('signup')
async signUp (
    @Body('username')username:string,
    @Body('email')email:string,
    @Body('password')password:string,
){
    const user =await this.userService.createUser(username,email,password);
    return {message:"User created succefully",user};

}
}
