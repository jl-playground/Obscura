import nodemailer from "nodemailer";
import Handlebars from "handlebars";
// In Bun, this import returns the absolute file path string
import resetPasswordPath from "@/app/features/email/templates/reset.password.template.hbs";
import welcomePath from "@/app/features/email/templates/welcome.template.hbs";

// Read the actual file content from the path
const resetPasswordTemplateSource = await Bun.file(resetPasswordPath).text();
const welcomeTemplateSource = await Bun.file(welcomePath).text();

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
  private welcomeTemplate = Handlebars.compile(welcomeTemplateSource);

  public async sendVerificationEmail(
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

  public async sendWelcomeMailEmail(
    to: string,
    subject: string,
    registerJWT: string,
    user: string,
  ): Promise<void> {
    try {
      const verifyLink = `${Bun.env.VERIFY_EMAIL_URL}${registerJWT}`;
      const html = this.welcomeTemplate({
        username: user,
        verifyLink,
      });

      const info = await this.mailTransporter.sendMail({
        from: Bun.env.SMTP_USER,
        to,
        subject,
        html,
      });

      console.log("Sent: %s", info.messageId);
    } catch (error) {
      console.error("Failed:", error);
    }
  }
}
