import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  SpaceAccessOption,
  SpaceAccessOptionSchema,
} from "./entities/space-access-option.entity";
import { SpaceAccessOptionController } from "./space-access-option.controller";
import { SpaceAccessOptionService } from "./space-access-option.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpaceAccessOption.name, schema: SpaceAccessOptionSchema },
    ]),
  ],
  controllers: [SpaceAccessOptionController],
  providers: [SpaceAccessOptionService],
})
export class SpaceAccessOptionModule {}