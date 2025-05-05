import api from "./api";

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
  created_at: string;
}

export interface PermissionCreateData {
  name: string;
  description?: string;
  category: string;
  type: string;
}

export interface PermissionUpdateData {
  name?: string;
  description?: string;
  category?: string;
  type?: string;
}

/**
 * Service for managing permissions
 */
export const permissionService = {
  /**
   * Get all permissions
   * @returns Promise with all permissions
   */
  getAllPermissions: async () => {
    return api.get("permissions");
  },

  /**
   * Get a specific permission by ID
   * @param id Permission ID
   * @returns Promise with permission details
   */
  getPermission: async (id: number) => {
    return api.get(`permissions/${id}`);
  },

  /**
   * Create a new permission
   * @param permissionData Permission data to create
   * @returns Promise with created permission
   */
  createPermission: async (permissionData: PermissionCreateData) => {
    return api.post("permissions", permissionData);
  },

  /**
   * Update an existing permission
   * @param id Permission ID to update
   * @param permissionData Permission data to update
   * @returns Promise with updated permission
   */
  updatePermission: async (id: number, permissionData: PermissionUpdateData) => {
    return api.put(`permissions/${id}`, permissionData);
  },

  /**
   * Delete a permission
   * @param id Permission ID to delete
   * @returns Promise with deletion result
   */
  deletePermission: async (id: number) => {
    return api.delete(`permissions/${id}`);
  },

  /**
   * Get permissions by category
   * @param category Category name
   * @returns Promise with permissions filtered by category
   */
  getPermissionsByCategory: async (category: string) => {
    return api.get(`permissions/category/${category}`);
  }
};

export default permissionService;
