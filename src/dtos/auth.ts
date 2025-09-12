export type AuthUserDto = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  isApproved?: boolean;
};

export type TokenPairDto = {
  access_token: string;
  refresh_token: string;
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = TokenPairDto & {
  user?: AuthUserDto;
};

export type AuthRefreshRequest = { refresh_token: string };
export type AuthRefreshResponse = TokenPairDto;
