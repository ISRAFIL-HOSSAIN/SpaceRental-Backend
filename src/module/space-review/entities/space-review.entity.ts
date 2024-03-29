import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNumber, Max, Min } from "class-validator";
import { HydratedDocument, Model, Types } from "mongoose";
import { ApplicationUser } from "../../application-user/entities/application-user.entity";
import { BaseEntity } from "../../common/entities/base.entity";
import { SpaceForRent } from "../../space-for-rent/entities/space-for-rent.entity";

export type SpaceReviewDocument = HydratedDocument<SpaceReview>;
export type SpaceReviewType = Model<SpaceReviewDocument>;

@Schema()
export class SpaceReview extends BaseEntity {
  @Prop({
    type: Types.ObjectId,
    ref: SpaceForRent.name,
    required: true,
  })
  space: string;

  @Prop({
    type: Types.ObjectId,
    ref: ApplicationUser.name,
    required: true,
  })
  reviewer: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Prop({ required: true, validate: (value: number) => value % 0.5 === 0 })
  rating: number;

  @Prop({ required: false })
  comment?: string;
}

export const SpaceReviewSchema = SchemaFactory.createForClass(SpaceReview);
