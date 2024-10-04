import { Body, Controller ,Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
constructor (private readonly userService:UserService){}

@Post ('signup')
async signUp (@Body()createUserDto:CreateUserDto){
   return this.userService.signup(createUserDto);

}
// @Post ('login'){
//    async login(@Body()loginDto:LoginDto)
// }
}
