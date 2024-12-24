export interface user {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface registerRequest {
  username: string;
  email: string;
  password: string;
}

export interface loginRequest {
  email: string;
  password: string;
}
