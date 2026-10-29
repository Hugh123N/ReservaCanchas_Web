import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface SessionClaims extends JwtPayload {
  exp: number;
  UserId: string;
  UserIdNegocio: number;
  email: string;
  UserName: string;
  DisplayName: string;
  Telefono: string;
  Roles: string[];
  [claim: string]: unknown;
}

export function decodeSessionToken(token: string | null): SessionClaims | null {
  if (!token) return null;
  try {
    const payload = jwtDecode<JwtPayload & Record<string, unknown>>(token);
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || Math.abs(payload.exp * 1000) > 8.64e15) return null;
    const text = (key: string): string => typeof payload[key] === 'string' ? payload[key] as string : '';
    const idNegocio = Number(payload['UserIdNegocio']);
    const rawRoles = payload['Roles'] ?? payload['roles'] ?? payload['role'];
    const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).filter((role): role is string => typeof role === 'string');
    return { ...payload, exp: payload.exp, UserId: text('UserId'),
      UserIdNegocio: Number.isSafeInteger(idNegocio) && idNegocio > 0 ? idNegocio : 0,
      email: text('email'), UserName: text('UserName'), DisplayName: text('DisplayName'), Telefono: text('Telefono'), Roles: roles };
  } catch {
    return null;
  }
}

export function getValidSessionClaims(token: string | null): SessionClaims | null {
  const claims = decodeSessionToken(token);
  return claims && claims.UserId && claims.exp * 1000 > Date.now() ? claims : null;
}
