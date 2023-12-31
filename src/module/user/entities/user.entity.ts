import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ImageModel } from "../../image/entities/image.entity";
import { UserRoleEnum } from "../enum/user-role.enum";

export type UserDocument = HydratedDocument<UserModel>;
export type UserModelType = Model<UserModel>;

@Schema({
  toJSON: {
    transform: function (_, ret) {
      delete ret?.password;
      delete ret?.isPasswordLess;
    },
  },
})
export class UserModel {
  @Prop({ required: true })
  email: string;

  @Prop({ default: "" })
  password: string;

  @Prop({ default: false })
  isPasswordLess: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserRoleEnum),
    default: UserRoleEnum.RENTER,
  })
  role: UserRoleEnum;

  @Prop({ default: null })
  fullName?: string;

  @Prop({ default: null })
  phoneNumber?: string;

  @Prop({ default: null })
  countryCode?: string;

  @Prop({ default: null })
  dateOfBirth?: Date;

  @Prop({ default: () => new Date() })
  dateJoined: Date;

  @Prop({ default: () => new Date() })
  lastLogin: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: ImageModel.name,
  })
  profilePicture?: ImageModel;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// Bind user email with role to be unique together
UserSchema.index({ email: 1, role: 1 }, { unique: true });
