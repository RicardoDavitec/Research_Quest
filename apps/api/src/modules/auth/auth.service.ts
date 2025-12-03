import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: signUpDto.email },
          { cpf: signUpDto.cpf },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email ou CPF');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: signUpDto.email,
        password: hashedPassword,
        cpf: signUpDto.cpf,
        name: signUpDto.name,
        phone: signUpDto.phone,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        cpf: user.cpf,
      },
      token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.validateUser(signInDto.email, signInDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        cpf: user.cpf,
      },
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        researcher: true,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        researcher: {
          include: {
            primaryInstitution: true,
            secondaryInstitution: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password, ...result } = user;
    return result;
  }
}
