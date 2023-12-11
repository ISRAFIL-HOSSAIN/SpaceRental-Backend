import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import { mongooseConfig } from "../../config/mongoose.config";

@Module({
  imports: [
    // --------------------//
    // Env Configurations //
    // --------------------//
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // -------------------------//
    // Database Configurations //
    // -------------------------//
    MongooseModule.forRootAsync(mongooseConfig),
    // -------------------------//
    // Multer Configurations //
    // -------------------------//
    MulterModule.register({
      // storage: memoryStorage(),
    }),
  ],
})
export class CommonModule {}
