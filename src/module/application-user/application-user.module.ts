import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EncryptionModule } from "../encryption/encryption.module";
import { ApplicationUserController } from "./application-user.controller";
import { ApplicationUserService } from "./application-user.service";
import {
  ApplicationUser,
  ApplicationUserSchema,
} from "./entities/application-user.entity";
import { RolesGuardProvider } from "./guards/application-user-roles.guard";
import { ApplicationUserRepository } from "./repository/application-user.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationUser.name, schema: ApplicationUserSchema },
    ]),
    EncryptionModule,
  ],
  controllers: [ApplicationUserController],
  providers: [
    RolesGuardProvider,
    ApplicationUserService,
    ApplicationUserRepository,
  ],
  exports: [MongooseModule, ApplicationUserService, ApplicationUserRepository],
})
export class ApplicationUserModule {}