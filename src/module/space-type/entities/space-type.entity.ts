import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

export type SpaceTypeDocument = HydratedDocument<SpaceTypeModel>;
export type SpaceTypeModelType = Model<SpaceTypeModel>;

@Schema()
export class SpaceTypeModel extends BaseEntity {
  @Prop({ type: String, required: true, unique: true })
  name: string;
}

export const SpaceTypeSchema = SchemaFactory.createForClass(SpaceTypeModel);
