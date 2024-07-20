import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req) {
    const prisma = req.prisma;
    if (!prisma) {
      throw new UnauthorizedException('Prisma client not initialized');
    }
    return this.authService.login(loginDto, prisma);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
