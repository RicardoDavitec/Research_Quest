import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email do pesquisador',
    example: 'joao.silva@universidade.edu.br',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do pesquisador',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
