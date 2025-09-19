export type AuthUserDto = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  isApproved?: boolean;
};

export type TokenPairDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = TokenPairDto & {
  user?: AuthUserDto;
};

export type AuthRefreshRequest = { refreshToken: string };
export type AuthRefreshResponse = TokenPairDto;
