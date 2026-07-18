import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '@core/services/auth-api.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly success = signal(false);
  readonly message = signal<string>('');

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const token = params['token'];
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      this.authApi.verifyEmail({ token }).subscribe({
        next: response => {
          this.isLoading.set(false);
          this.success.set(true);
          this.message.set(response.message);
        },
        error: error => {
          this.isLoading.set(false);
          this.success.set(false);
          this.message.set(error.error?.message || 'Verification failed');
        },
      });
    });
  }
}
