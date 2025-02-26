// export interface AdminCredentials {
//   // username: string;
//   email: string
//   password: string;
// }

// export interface JWTPayload {
//   userId: string;
//   email:string;
//   // username: string;
//   role: string;
// }

// export interface LoginResponse {
//   token: string;
// }

export interface AdminCredentials {
  email: string;
  password: string;
}



export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  role?: string;
  email?: string;
  id?: string;
  error?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    role: string;
    email: string;
    id: string;
  };
}