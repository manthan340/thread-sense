import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: Number(this.config.get<string>('SMTP_PORT', '1025')),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    const from = this.config.get<string>(
      'SMTP_FROM',
      'Thread Sense <noreply@thread-sense.local>',
    );

    try {
      const info = await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, verifyUrl: string) {
    await this.sendMail({
      to: email,
      subject: 'Verify your Thread Sense email',
      text: `Verify your email by opening this link: ${verifyUrl}`,
      html: `<p>Welcome to Thread Sense.</p><p><a href="${verifyUrl}">Verify your email</a></p><p>Or open: ${verifyUrl}</p>`,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    await this.sendMail({
      to: email,
      subject: 'Reset your Thread Sense password',
      text: `Reset your password by opening this link: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset password</a></p><p>Or open: ${resetUrl}</p><p>If you did not request this, ignore this email.</p>`,
    });
  }
}
