export type RoleName = "admin" | "developer" | "moderator" | "user";

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  permissions: string[];
  role: RoleName;
  status: "active" | "inactive" | "invited" | "unverified";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  expiresAt?: string;
  user: AuthUser | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
