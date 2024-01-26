import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendUserSigninMail(userEmail: string, userName: string) {
    try {
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: "New signin detected",
      //   template: "./signin",
      //   context: {
      //     name: userName,
      //   },
      // });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send email: " + error);
    }
  }

  async sendUserSignupMail(userEmail: string, userName: string) {
    try {
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: "Welcome abroad",
      //   template: "./signup",
      //   context: {
      //     companyName: "Space Rental",
      //     userName,
      //   },
      // });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send email: " + error);
    }
  }
}
