import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'roles';

export const Roles = (role: string) => SetMetadata(ROLE_KEY, role);
