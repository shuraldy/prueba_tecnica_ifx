import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../auth/domain/entities/user.entity';

export type { UserRole as Role };

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
