import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });

    await this.issueAndSendVerification(user.id, user.email);

    return {
      message:
        'Registered successfully. Check your email to verify your account.',
      user: { id: user.id, email: user.email, emailVerified: false },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Check your inbox or resend verification.',
      );
    }

    return {
      accessToken: await this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true, createdAt: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async verifyEmail(token: string) {
    const record = await this.findValidToken(
      token,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.authToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully. You can log in now.' };
  }

  async resendVerification(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Avoid account enumeration
    if (!user || user.emailVerified) {
      return {
        message:
          'If that email is registered and unverified, a verification link was sent.',
      };
    }

    await this.issueAndSendVerification(user.id, user.email);
    return {
      message:
        'If that email is registered and unverified, a verification link was sent.',
    };
  }

  async forgotPassword(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await this.createToken(
        user.id,
        AuthTokenType.PASSWORD_RESET,
        60,
      );
      const resetUrl = `${this.webOrigin()}/reset-password?token=${token}`;
      await this.mail.sendPasswordResetEmail(user.email, resetUrl);
    }

    return {
      message:
        'If that email is registered, a password reset link was sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.findValidToken(
      token,
      AuthTokenType.PASSWORD_RESET,
    );
    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password updated. You can log in with your new password.' };
  }

  private async issueAndSendVerification(userId: string, email: string) {
    const token = await this.createToken(
      userId,
      AuthTokenType.EMAIL_VERIFICATION,
      24 * 60,
    );
    const verifyUrl = `${this.webOrigin()}/verify-email?token=${token}`;
    await this.mail.sendVerificationEmail(email, verifyUrl);
  }

  private async createToken(
    userId: string,
    type: AuthTokenType,
    expiresInMinutes: number,
  ) {
    await this.prisma.authToken.deleteMany({
      where: { userId, type, usedAt: null },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.prisma.authToken.create({
      data: { token, type, expiresAt, userId },
    });

    return token;
  }

  private async findValidToken(token: string, type: AuthTokenType) {
    const record = await this.prisma.authToken.findUnique({ where: { token } });
    if (!record || record.type !== type) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (record.usedAt) {
      throw new BadRequestException('Token already used');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }
    return record;
  }

  private async signToken(userId: string, email: string) {
    return this.jwt.signAsync({ sub: userId, email });
  }

  private webOrigin() {
    return this.config.get<string>('WEB_ORIGIN', 'http://localhost:3000');
  }
}
