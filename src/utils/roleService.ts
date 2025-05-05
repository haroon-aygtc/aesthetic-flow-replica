import api from "./api";
import { Permission } from "./permissionService";

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions?: Permission[];
  created_at?: string;
}

export interface RoleCreateData {
  name: string;
  description?: string;
}

export interface RoleUpdateData {
  name?: string;
  description?: string;
}

/**
 * Service for managing roles
 */
export const roleService = {
  /**
   * Get all roles
   * @returns Promise with all roles
   */
  getAllRoles: async () => {
    return api.get("roles");
  },

  /**
   * Get a specific role by ID
   * @param id Role ID
   * @returns Promise with role details including assigned permissions
   */
  getRole: async (id: number) => {
    return api.get(`roles/${id}`);
  },

  /**
   * Create a new role
   * @param roleData Role data to create
   * @returns Promise with created role
   */
  createRole: async (roleData: RoleCreateData) => {
    return api.post("roles", roleData);
  },

  /**
   * Update an existing role
   * @param id Role ID to update
   * @param roleData Role data to update
   * @returns Promise with updated role
   */
  updateRole: async (id: number, roleData: RoleUpdateData) => {
    return api.put(`roles/${id}`, roleData);
  },

  /**
   * Delete a role
   * @param id Role ID to delete
   * @returns Promise with deletion result
   */
  deleteRole: async (id: number) => {
    return api.delete(`roles/${id}`);
  },

  /**
   * Assign permissions to a role
   * @param roleId Role ID to assign permissions to
   * @param permissions Array of permission IDs to assign
   * @returns Promise with assignment result
   */
  assignPermissions: async (roleId: number, permissions: number[]) => {
    return api.post(`roles/${roleId}/permissions`, { permissions });
  },
  
  /**
   * Get roles with specific permission
   * @param permissionId Permission ID to filter by
   * @returns Promise with roles that have the specified permission
   */
  getRolesByPermission: async (permissionId: number) => {
    return api.get(`roles/permission/${permissionId}`);
  }
};

export default roleService;
