// src/user/schemas/admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Admin extends Document {
  @Prop({ required: true })
  firstname: string;


  @Prop({ required: true })
  lastname: string;

  // @Prop({ required: true })
  // phonenumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({default:`admin`, required: true })
  role: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
