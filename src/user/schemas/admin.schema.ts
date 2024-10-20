import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema()
export class Admin extends Document{
    @Prop({required:true})
    firstname:string;

    @Prop({required:true})
    lastname:string;

    @Prop({required:true})
    email:string;
   
    @Prop({required:true})
    phonenumber:string;

    @Prop({required:true})
    address:string;

    @Prop({required:true})
    role:string;
}
export const AdminSchema =SchemaFactory.createForClass(Admin);