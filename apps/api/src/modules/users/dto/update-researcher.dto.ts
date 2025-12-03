import { PartialType } from '@nestjs/swagger';
import { CreateResearcherDto } from './create-researcher.dto';

export class UpdateResearcherDto extends PartialType(CreateResearcherDto) {}
