import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'; // Adicionado UnauthorizedException
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
// Removido UsersService se validateUser está neste arquivo, senão mantenha.

@Injectable()
export class AuthService {
  changePassword(userId: any, currentPassword: string, newPassword: string) {
    throw new Error('Method not implemented.');
  }
  resetPassword(token: string, password: string) {
    throw new Error('Method not implemented.');
  }
  forgotPassword(email: string) {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(AuthService.name);
  private invalidTokens = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.debug(`Validando usuário com email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
        // Incluir o driver relacionado para pegar o ID dele
        driver: {
          select: {
            id: true // Seleciona apenas o ID do motorista
          }
        }
      },
    });

    // Verificar se o usuário existe e a senha está correta
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      // Remover a senha do objeto do usuário antes de retornar
      const { password, ...result } = user;
      return result; // Retorna o usuário com role e o driver (se existir)
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: any = { 
      email: user.email, 
      sub: user.id,       // userId
      role: user.role.name, 
      tenantId: user.tenantId 
    };

    // Adicionar driverId ao payload se o usuário for um motorista e tiver um perfil de motorista
    if ((user.role.name === 'driver' || user.role === 'DRIVER') && user.driver) { // user.driver agora vem do include
      payload.driverId = user.driver.id;
    } else if ((user.role.name === 'driver' || user.role === 'DRIVER') && !user.driver) {
        this.logger.warn(`Usuário ${user.id} com role 'driver' não possui um perfil de motorista (Driver) vinculado no banco.`);
    }
    
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION || '600m' });
    const refreshToken = this.jwtService.sign({ sub: user.id }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' });
    
    // Retornar o driverId também no objeto user da resposta do login, se o frontend mobile precisar dele imediatamente
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        tenantId: user.tenantId,
        driverId: payload.driverId || null, // Garante que driverId esteja na resposta
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userResponse, // Adiciona o objeto user à resposta
    };
  }

  async refreshToken(token: string) {
    try {
      // Ao verificar o refresh token, o payload dele é apenas { sub: userId } como definido acima
      const refreshPayload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      
      // Buscar o usuário e seu driverId novamente para garantir dados atualizados no novo access token
      const userWithDetails = await this.prisma.user.findUnique({
          where: { id: refreshPayload.sub },
          include: { 
              role: true,
              driver: { select: { id: true } }
          }
      });

      if (!userWithDetails) {
          throw new UnauthorizedException('Usuário do token de atualização não encontrado.');
      }

      const newAccessTokenPayload: any = { 
          email: userWithDetails.email, 
          sub: userWithDetails.id, 
          role: userWithDetails.role.name, 
          tenantId: userWithDetails.tenantId 
      };

      if (userWithDetails.driver) {
          newAccessTokenPayload.driverId = userWithDetails.driver.id;
      }

      const newAccessToken = this.jwtService.sign(newAccessTokenPayload, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION || '600m' });
      return { access_token: newAccessToken };
    } catch (e) {
      this.logger.error('Falha ao atualizar token:', e.message);
      throw new UnauthorizedException('Token de atualização inválido ou expirado.');
    }
  }

  async logout(token: string): Promise<void> {
    this.invalidTokens.add(token);
  }

  async isTokenInvalid(token: string): Promise<boolean> {
    return this.invalidTokens.has(token);
  }
}