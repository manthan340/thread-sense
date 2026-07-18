import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ImageResponseDto, UpdateTagsDto } from '@models/api/image.models';

@Injectable({
  providedIn: 'root',
})
export class ImagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly endpoints = API_CONFIG.endpoints.images;

  upload(file: File, tags: UpdateTagsDto): Observable<ImageResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    if (tags.category) formData.append('category', tags.category);
    if (tags.color) formData.append('color', tags.color);
    if (tags.season) formData.append('season', tags.season);
    if (tags.occasion) formData.append('occasion', tags.occasion);
    if (tags.style) formData.append('style', tags.style);
    if (tags.material) formData.append('material', tags.material);
    if (tags.pattern) formData.append('pattern', tags.pattern);
    if (tags.formality) formData.append('formality', tags.formality);

    return this.http.post<ImageResponseDto>(`${this.baseUrl}${this.endpoints.upload}`, formData);
  }

  list(): Observable<ImageResponseDto[]> {
    return this.http.get<ImageResponseDto[]>(`${this.baseUrl}${this.endpoints.list}`);
  }

  updateTags(id: string, tags: UpdateTagsDto): Observable<ImageResponseDto> {
    return this.http.patch<ImageResponseDto>(
      `${this.baseUrl}${this.endpoints.updateTags(id)}`,
      tags
    );
  }
}
