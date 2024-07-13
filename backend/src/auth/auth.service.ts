import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private invalidTokens = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.debug(`Validating user with email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    this.logger.debug(`Logging in user with email: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role.name, tenantId: user.tenantId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '120m' }); // Ajuste o tempo de expiração do access token aqui
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Ajuste o tempo de expiração do refresh token aqui
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const newAccessToken = this.jwtService.sign({ email: payload.email, sub: payload.sub, role: payload.role, tenantId: payload.tenantId }, { expiresIn: '120m' }); // Ajuste o tempo de expiração do novo access token aqui
      return { access_token: newAccessToken };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    this.invalidTokens.add(token);
  }

  async isTokenInvalid(token: string): Promise<boolean> {
    return this.invalidTokens.has(token);
  }
}
