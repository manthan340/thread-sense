import { Component, inject, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImagesApiService } from '@core/services/images-api.service';
import { CaptureState } from '@models/view/image.view-models';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.scss',
})
export class CaptureComponent implements OnDestroy {
  private readonly imagesApi = inject(ImagesApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  readonly captureState = signal<CaptureState>({ status: 'idle' });

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      this.captureState.update(state => ({ ...state, status: 'requesting-permission' }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      this.captureState.update(state => ({ ...state, status: 'streaming', stream }));

      setTimeout(() => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      this.captureState.update(state => ({
        ...state,
        status: 'failed',
        error: 'Camera permission denied or not available',
      }));
      this.snackBar.open('Camera permission denied', 'Close', { duration: 3000 });
    }
  }

  stopCamera() {
    const stream = this.captureState().stream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  capturePhoto() {
    const video = this.videoElement?.nativeElement;
    const canvas = this.canvasElement?.nativeElement;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        this.captureState.update(state => ({
          ...state,
          status: 'captured',
          capturedImage: blob,
          previewUrl,
        }));
        this.stopCamera();
      }
    }, 'image/jpeg', 0.95);
  }

  retake() {
    const previewUrl = this.captureState().previewUrl;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this.captureState.set({ status: 'idle' });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      this.captureState.update(state => ({
        ...state,
        status: 'captured',
        capturedImage: file,
        previewUrl,
      }));
    }
  }

  upload() {
    const capturedImage = this.captureState().capturedImage;
    if (!capturedImage) return;

    const file = new File([capturedImage], `photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    this.captureState.update(state => ({ ...state, status: 'uploading', progress: 0 }));

    this.imagesApi.upload(file, {}).subscribe({
      next: image => {
        this.captureState.update(state => ({ ...state, status: 'success' }));
        this.snackBar.open('Photo uploaded successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/analysis', image.id]);
      },
      error: () => {
        this.captureState.update(state => ({
          ...state,
          status: 'failed',
          error: 'Upload failed',
        }));
      },
    });
  }

  get isIdle() {
    return this.captureState().status === 'idle';
  }

  get isStreaming() {
    return this.captureState().status === 'streaming';
  }

  get isCaptured() {
    return this.captureState().status === 'captured';
  }

  get isUploading() {
    return this.captureState().status === 'uploading';
  }
}
