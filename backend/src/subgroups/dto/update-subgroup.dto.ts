import { PartialType } from '@nestjs/swagger';
import { CreateSubgroupDto } from './create-subgroup.dto';

export class UpdateSubgroupDto extends PartialType(CreateSubgroupDto) {}
