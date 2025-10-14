export interface EchoUser {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }
  
  export interface AuthenticateUserResponse {
    user: EchoUser;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }
  
  export interface EchoBalance {
    totalPaid: number;
    totalSpent: number;
    balance: number;
    currency: string;
  }
  