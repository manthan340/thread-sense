import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthApiService } from '@core/services/auth-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly isLoading = signal(false);
  readonly token = signal<string | null>(null);

  readonly resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.token.set(params['token'] || null);
      if (!this.token()) {
        this.router.navigate(['/login']);
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token()) {
      const { password, confirmPassword } = this.resetPasswordForm.value;

      if (password !== confirmPassword) {
        this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
        return;
      }

      this.isLoading.set(true);

      this.authApi.resetPassword({ token: this.token()!, password: password! }).subscribe({
        next: response => {
          this.isLoading.set(false);
          this.snackBar.open(response.message, 'Close', { duration: 5000 });
          this.router.navigate(['/login']);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    }
  }
}
