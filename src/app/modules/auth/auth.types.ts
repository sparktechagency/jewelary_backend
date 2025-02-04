export interface AdminCredentials {
  username: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
}