import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResearchersService } from '../researchers/researchers.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private researchersService: ResearchersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const researcher = await this.researchersService.findByEmail(loginDto.email);

    if (!researcher) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, researcher.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!researcher.isActive) {
      throw new UnauthorizedException('Conta inativa');
    }

    const payload = {
      sub: researcher.id,
      email: researcher.email,
      role: researcher.role,
      subgroupId: researcher.subgroupId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: researcher.id,
        name: researcher.name,
        email: researcher.email,
        role: researcher.role,
        subgroupId: researcher.subgroupId,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const researcher = await this.researchersService.findByEmail(email);

    if (researcher && (await bcrypt.compare(password, researcher.password))) {
      const { password, ...result } = researcher;
      return result;
    }

    return null;
  }
}
