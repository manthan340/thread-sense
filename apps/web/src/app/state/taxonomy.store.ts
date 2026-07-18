import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TaxonomiesApiService } from '@core/services/taxonomies-api.service';
import { TaxonomiesResponseDto } from '@models/api/taxonomy.models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

interface TaxonomyState {
  taxonomies: TaxonomiesResponseDto | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

const initialState: TaxonomyState = {
  taxonomies: null,
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const TaxonomyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const taxonomiesApi = inject(TaxonomiesApiService);

    return {
      loadTaxonomies: rxMethod<void>(
        switchMap(() => {
          if (store.isLoaded()) {
            return of();
          }
          patchState(store, { isLoading: true, error: null });
          
          return taxonomiesApi.getTaxonomies().pipe(
            tap((taxonomies: TaxonomiesResponseDto) => {
              patchState(store, {
                taxonomies,
                isLoading: false,
                isLoaded: true,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load taxonomies',
              });
              return of();
            })
          );
        })
      ),
    };
  })
);
