import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { ImagesApiService } from '@core/services/images-api.service';
import { ImageResponseDto } from '@models/api/image.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly imagesApi = inject(ImagesApiService);

  readonly recentImages = signal<ImageResponseDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit() {
    this.loadRecentImages();
  }

  loadRecentImages() {
    this.imagesApi.list().subscribe({
      next: images => {
        this.recentImages.set(images.slice(0, 6));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
