import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetPasswordPath = path.resolve(__dirname, 'templates', 'reset.password.template.hbs');
const welcomePath = path.resolve(__dirname, 'templates', 'welcome.template.hbs');
// Read the actual file content from the path
const resetPasswordTemplateSource = await readFile(resetPasswordPath, 'utf-8');
const welcomeTemplateSource = await readFile(welcomePath, 'utf-8');

export default class EmailService {
  private mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Enforces explicit TLS/SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Compile the loaded source
  private resetPasswordTemplate = Handlebars.compile(resetPasswordTemplateSource);

  private welcomeTemplate = Handlebars.compile(welcomeTemplateSource);

  public async sendVerificationEmail(to: string, subject: string, token: string, user: string): Promise<void> {
    try {
      const deepLink = `${process.env.RESET_PASSWORD_URL}${token}`;

      const htmlContent = this.resetPasswordTemplate({
        resetLink: deepLink,
        username: user,
      });

      const info = await this.mailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html: htmlContent,
      });

      console.log('Sent: %s', info.messageId);
    } catch (error) {
      console.error('Failed:', error);
    }
  }

  public async sendWelcomeMailEmail(to: string, subject: string, registerJWT: string, user: string): Promise<void> {
    try {
      const verifyLink = `${process.env.VERIFY_EMAIL_URL}${registerJWT}`;
      const html = this.welcomeTemplate({
        username: user,
        verifyLink,
      });

      const info = await this.mailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      console.log('Sent: %s', info.messageId);
    } catch (error) {
      console.error('Failed:', error);
    }
  }
}
