import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateResearchGroupDto } from './create-research-group.dto';

export class UpdateResearchGroupDto extends PartialType(
  OmitType(CreateResearchGroupDto, ['projectId'] as const)
) {}
