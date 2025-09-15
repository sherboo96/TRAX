import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponse,
} from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/Roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(this.apiUrl);
  }

  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: number, role: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Grant permission to a role
  grantPermission(roleId: number, permissionId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${roleId}/permissions/${permissionId}/grant`,
      {}
    );
  }

  // Revoke permission from a role
  revokePermission(roleId: number, permissionId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${roleId}/permissions/${permissionId}/revoke`,
      {}
    );
  }
}
