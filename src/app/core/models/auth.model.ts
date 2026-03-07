export interface LoginRequest {
  userName: string;
  password: string;
}

export interface TokenDTO {
  token: string;
}

export interface LoginResponse {
  id: number;
  token: TokenDTO;
}
