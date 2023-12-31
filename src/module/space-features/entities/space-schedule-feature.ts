import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

export type SpaceScheduleFeatureDocument =
  HydratedDocument<SpaceScheduleFeatureModel>;
export type SpaceScheduleFeatureModelType = Model<SpaceScheduleFeatureModel>;

@Schema()
export class SpaceScheduleFeatureModel extends BaseEntity {
  @Prop({ type: String, required: true, unique: true })
  name: string;
}

export const SpaceScheduleFeatureSchema = SchemaFactory.createForClass(
  SpaceScheduleFeatureModel,
);
