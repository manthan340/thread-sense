export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  message: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface VerifyEmailResponseDto {
  message: string;
}

export interface ResendVerificationRequestDto {
  email: string;
}

export interface ResendVerificationResponseDto {
  message: string;
}
