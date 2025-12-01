// src/auth/types/jwt-payload.type.ts
import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: Role;
}
