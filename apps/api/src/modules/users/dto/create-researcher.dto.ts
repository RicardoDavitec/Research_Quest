import { IsEnum, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateResearcherDto {
  @ApiProperty({ enum: UserRole, default: UserRole.PESQUISADOR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  latesId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orcidId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  researchArea?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  professionalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  professionalType?: string;

  @ApiProperty()
  @IsUUID()
  primaryInstitutionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  secondaryInstitutionId?: string;
}
