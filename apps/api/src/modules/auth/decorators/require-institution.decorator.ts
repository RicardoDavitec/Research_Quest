import { SetMetadata } from '@nestjs/common';

export const REQUIRE_INSTITUTION_KEY = 'requireInstitution';
export const RequireInstitution = () => SetMetadata(REQUIRE_INSTITUTION_KEY, true);
