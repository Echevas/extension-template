import type { GetBalanceResponse } from "@merit-systems/echo-typescript-sdk";

export interface EchoUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
  
  export interface AuthenticateUserResponse {
    user: EchoUser;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }
  
  export type EchoBalance = GetBalanceResponse;