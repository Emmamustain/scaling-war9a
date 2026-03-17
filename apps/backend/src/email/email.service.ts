import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
        secure: false,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('email_service_not_configured SMTP credentials missing, emails disabled');
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`email_skipped to=${options.to} subject="${options.subject}"`);
      return;
    }

    const from = this.configService.get<string>('EMAIL_FROM') ?? 'noreply@war9a.app';
    try {
      await this.transporter.sendMail({ from, ...options });
    } catch (error) {
      this.logger.error(`email_send_failed to=${options.to}`, error);
    }
  }

  async sendQueueCalledEmail(
    email: string,
    username: string,
    businessName: string,
    serviceName: string,
    guichetName: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `It's your turn at ${businessName}!`,
      html: `
        <h2>It's your turn!</h2>
        <p>Hello ${username},</p>
        <p>You have been called for <strong>${serviceName}</strong> at <strong>${businessName}</strong>.</p>
        <p>Please proceed to <strong>${guichetName}</strong>.</p>
        <p>Thank you for using War9a!</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to War9a!',
      html: `
        <h2>Welcome to War9a, ${username}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Start discovering businesses and joining virtual queues near you.</p>
      `,
    });
  }
}
