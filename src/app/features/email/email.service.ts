import nodemailer from "nodemailer";
import Handlebars from "handlebars";
// In Bun, this import returns the absolute file path string
import resetPasswordPath from "@/app/features/email/templates/reset.password.template.hbs";

// Read the actual file content from the path
const resetPasswordTemplateSource = await Bun.file(resetPasswordPath).text();

export class EmailService {
  private mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: Bun.env.SMTP_USER,
      pass: Bun.env.SMTP_PASS,
    },
  });

  // Compile the loaded source
  private resetPasswordTemplate = Handlebars.compile(
    resetPasswordTemplateSource,
  );

  public async sendEmail(
    to: string,
    subject: string,
    token: string,
    user: string,
  ): Promise<void> {
    try {
      const deepLink = `${Bun.env.RESET_PASSWORD_URL}${token}`;

      const htmlContent = this.resetPasswordTemplate({
        resetLink: deepLink,
        username: user,
      });

      console.log(htmlContent);
      const info = await this.mailTransporter.sendMail({
        from: Bun.env.SMTP_USER,
        to,
        subject,
        html: htmlContent,
      });

      console.log("Sent: %s", info.messageId);
    } catch (error) {
      console.error("Failed:", error);
    }
  }
}
