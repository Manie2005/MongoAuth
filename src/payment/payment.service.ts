import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { instanceToInstance } from 'class-transformer';
import * as dotenv from 'dotenv';
import { User } from 'src/user/schemas/user.schema';

dotenv.config(); // Load environment variables from .env file

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey: string;

  constructor() {
    // Set your Paystack secret key from the .env file
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  /**
   * Initializes a payment request with Paystack
   * @param email The user's email
   * @param amount The amount to be paid (in Naira, but converted to Kobo)
   * @returns Payment initialization data from Paystack
   */
  async initializePayment(email: string, amount: number): Promise<any> {
    const url = 'https://api.paystack.co/transaction/initialize'; // Paystack endpoint for initializing payment

    const headers = {
      Authorization: `Bearer ${this.paystackSecretKey}`, // Paystack secret key for authorization
      'Content-Type': 'application/json', // Content type header for JSON request
    };

    const data = {
      email,
      amount: amount * 100, // Convert Naira to Kobo which is the smallest currency unit for Paystack
    };

    try {
      // Make POST request to Paystack to initialize the payment
      const response = await axios.post(url, data, { headers });
      return response.data; // Return the Paystack response data
    } catch (error) {
      // Throw an error if the payment initialization fails
      throw new HttpException(
        `Payment Initialization Failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
     }
    instanceToInstance() {
        throw new Error('Method not implemented.');
    }

  /**
   * Verifies the payment using Paystack's verification endpoint
   * @param reference The transaction reference from Paystack
   * @returns Payment verification data from Paystack
   */
  async verifyPayment(reference: string): Promise<any> {
    const url = `https://api.paystack.co/transaction/verify/${reference}`; // Paystack endpoint for verifying payments

    const headers = {
      Authorization: `Bearer ${this.paystackSecretKey}`, // Paystack secret key for authorization
    };

    try {
      // Make GET request to Paystack to verify the payment
      const response = await axios.get(url, { headers });
      return response.data; // Return the Paystack response data
    } catch (error) {
      throw new HttpException(
        `Payment Verification Failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
