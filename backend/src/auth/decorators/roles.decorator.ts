import { SetMetadata } from '@nestjs/common';
import { ResearcherRole } from '../../researchers/entities/researcher.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ResearcherRole[]) => SetMetadata(ROLES_KEY, roles);
