import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  ResendVerificationRequestDto,
  ResendVerificationResponseDto,
} from '@models/api/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly endpoints = API_CONFIG.endpoints.auth;

  register(dto: RegisterRequestDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(
      `${this.baseUrl}${this.endpoints.register}`,
      dto
    );
  }

  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}${this.endpoints.login}`, dto);
  }

  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}${this.endpoints.me}`);
  }

  verifyEmail(dto: VerifyEmailRequestDto): Observable<VerifyEmailResponseDto> {
    return this.http.post<VerifyEmailResponseDto>(
      `${this.baseUrl}${this.endpoints.verifyEmail}`,
      dto
    );
  }

  resendVerification(
    dto: ResendVerificationRequestDto
  ): Observable<ResendVerificationResponseDto> {
    return this.http.post<ResendVerificationResponseDto>(
      `${this.baseUrl}${this.endpoints.resendVerification}`,
      dto
    );
  }

  forgotPassword(dto: ForgotPasswordRequestDto): Observable<ForgotPasswordResponseDto> {
    return this.http.post<ForgotPasswordResponseDto>(
      `${this.baseUrl}${this.endpoints.forgotPassword}`,
      dto
    );
  }

  resetPassword(dto: ResetPasswordRequestDto): Observable<ResetPasswordResponseDto> {
    return this.http.post<ResetPasswordResponseDto>(
      `${this.baseUrl}${this.endpoints.resetPassword}`,
      dto
    );
  }
}
