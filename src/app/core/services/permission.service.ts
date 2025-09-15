import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permission, PermissionResponse } from '../models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/Permissions`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(this.apiUrl);
  }

  getPermission(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }
}
