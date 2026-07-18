import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImagesApiService } from '@core/services/images-api.service';
import { TaxonomyStore } from '@state/taxonomy.store';
import { ImageResponseDto } from '@models/api/image.models';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
})
export class AnalysisComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly imagesApi = inject(ImagesApiService);
  private readonly taxonomyStore = inject(TaxonomyStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly image = signal<ImageResponseDto | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly taxonomies = this.taxonomyStore.taxonomies;

  readonly tagsForm = this.fb.group({
    category: [null as string | null],
    color: [null as string | null],
    season: [null as string | null],
    occasion: [null as string | null],
    style: [null as string | null],
    material: [null as string | null],
    pattern: [null as string | null],
    formality: [null as string | null],
  });

  ngOnInit() {
    this.taxonomyStore.loadTaxonomies();

    this.route.params.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.loadImage(id);
      }
    });
  }

  loadImage(id: string) {
    this.isLoading.set(true);
    this.imagesApi.list().subscribe({
      next: images => {
        const image = images.find(img => img.id === id);
        if (image) {
          this.image.set(image);
          this.tagsForm.patchValue({
            category: image.category,
            color: image.color,
            season: image.season,
            occasion: image.occasion,
            style: image.style,
            material: image.material,
            pattern: image.pattern,
            formality: image.formality,
          });
        } else {
          this.router.navigate(['/wardrobe']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/wardrobe']);
      },
    });
  }

  saveTags() {
    const imageId = this.image()?.id;
    if (!imageId) return;

    this.isSaving.set(true);
    const formValue = this.tagsForm.value;

    this.imagesApi
      .updateTags(imageId, {
        category: formValue.category as any,
        color: formValue.color as any,
        season: formValue.season as any,
        occasion: formValue.occasion as any,
        style: formValue.style as any,
        material: formValue.material as any,
        pattern: formValue.pattern as any,
        formality: formValue.formality as any,
      })
      .subscribe({
        next: updatedImage => {
          this.image.set(updatedImage);
          this.isSaving.set(false);
          this.snackBar.open('Tags updated successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }
}
