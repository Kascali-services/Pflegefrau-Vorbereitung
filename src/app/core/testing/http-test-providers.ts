import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

/**
 * Test helper to provide HTTP client and testing utilities
 * Use this in TestBed.configureTestingModule providers array
 * 
 * Example:
 * TestBed.configureTestingModule({
 *   providers: [...getHttpTestProviders()]
 * })
 */
export function getHttpTestProviders() {
  return [provideHttpClient(), provideHttpClientTesting()];
}
