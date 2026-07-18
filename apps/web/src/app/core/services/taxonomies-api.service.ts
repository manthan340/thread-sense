import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { TaxonomiesResponseDto } from '@models/api/taxonomy.models';

@Injectable({
  providedIn: 'root',
})
export class TaxonomiesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly endpoints = API_CONFIG.endpoints.taxonomies;

  getTaxonomies(): Observable<TaxonomiesResponseDto> {
    return this.http.get<TaxonomiesResponseDto>(`${this.baseUrl}${this.endpoints.list}`);
  }
}
