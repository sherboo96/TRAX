import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateLocationDto,
  Location,
  LocationCategory,
} from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private baseUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Location[]>> {
    return this.http.get<ApiResponse<Location[]>>(this.baseUrl);
  }

  getActive(): Observable<ApiResponse<Location[]>> {
    return this.http.get<ApiResponse<Location[]>>(`${this.baseUrl}/active`);
  }

  getByCategory(
    category: LocationCategory
  ): Observable<ApiResponse<Location[]>> {
    return this.http.get<ApiResponse<Location[]>>(
      `${this.baseUrl}/category/${category}`
    );
  }

  getById(id: number): Observable<ApiResponse<Location>> {
    return this.http.get<ApiResponse<Location>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateLocationDto): Observable<ApiResponse<Location>> {
    const form = new FormData();
    form.append('NameEn', payload.nameEn);
    if (payload.nameAr) form.append('NameAr', payload.nameAr);
    if (payload.addressEn) form.append('AddressEn', payload.addressEn);
    if (payload.addressAr) form.append('AddressAr', payload.addressAr);
    if (payload.city) form.append('City', payload.city);
    if (payload.country) form.append('Country', payload.country);
    form.append('Category', String(payload.category));
    if (payload.isActive !== undefined)
      form.append('IsActive', String(payload.isActive));
    if (payload.templateFile) form.append('templateFile', payload.templateFile);
    return this.http.post<ApiResponse<Location>>(this.baseUrl, form);
  }

  update(
    id: number,
    payload: CreateLocationDto
  ): Observable<ApiResponse<Location>> {
    const form = new FormData();
    form.append('NameEn', payload.nameEn);
    if (payload.nameAr) form.append('NameAr', payload.nameAr);
    if (payload.addressEn) form.append('AddressEn', payload.addressEn);
    if (payload.addressAr) form.append('AddressAr', payload.addressAr);
    if (payload.city) form.append('City', payload.city);
    if (payload.country) form.append('Country', payload.country);
    form.append('Category', String(payload.category));
    if (payload.isActive !== undefined)
      form.append('IsActive', String(payload.isActive));
    if (payload.templateFile) form.append('templateFile', payload.templateFile);
    return this.http.put<ApiResponse<Location>>(`${this.baseUrl}/${id}`, form);
  }

  delete(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(
      `${this.baseUrl}/${id}/toggle-status`,
      {}
    );
  }
}
