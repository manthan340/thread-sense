import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImagesApiService } from '@core/services/images-api.service';
import { ImageResponseDto } from '@models/api/image.models';

@Component({
  selector: 'app-wardrobe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './wardrobe.component.html',
  styleUrl: './wardrobe.component.scss',
})
export class WardrobeComponent implements OnInit {
  private readonly imagesApi = inject(ImagesApiService);

  readonly images = signal<ImageResponseDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.isLoading.set(true);
    this.imagesApi.list().subscribe({
      next: images => {
        this.images.set(images);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
