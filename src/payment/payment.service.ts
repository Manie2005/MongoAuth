import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { Axios } from 'axios';
 
@Injectable()
export class PaymentService {
    private readonly PAYSTACK_API_URL='https://api.paystack.co';
    private readonly PAYSTACK_SECRET_KEY=process.env.PAYSTACK_SECRET_KEY;
async initializepayment(email:string, amount:number){

    
}







}
