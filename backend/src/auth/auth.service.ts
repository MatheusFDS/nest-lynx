import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private invalidTokens = new Set<string>();

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string, prisma: PrismaClient): Promise<any> {
    this.logger.debug(`Validating user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      this.logger.debug('User not found');
      return null;
    }
    const passwordValid = await bcrypt.compare(pass, user.password);
    if (!passwordValid) {
      this.logger.debug('Invalid password');
      return null;
    }
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, prisma: PrismaClient) {
    this.logger.debug(`Logging in user with email: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password, prisma);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role.name, tenantId: user.tenantId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '600m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const newAccessToken = this.jwtService.sign({ email: payload.email, sub: payload.sub, role: payload.role, tenantId: payload.tenantId }, { expiresIn: '600m' });
      return { access_token: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    this.invalidTokens.add(token);
  }

  async isTokenInvalid(token: string): Promise<boolean> {
    return this.invalidTokens.has(token);
  }
}
