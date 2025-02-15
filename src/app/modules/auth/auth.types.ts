export interface AdminCredentials {
  // username: string;
  email: string
  password: string;
}

export interface JWTPayload {
  userId: string;
  email:string;
  // username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
}