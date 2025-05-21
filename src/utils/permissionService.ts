import httpClient from "@/api/http-client";
import { endpoints } from "@/api/endpoints";

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
    return httpClient.get(endpoints.permissions.base);
  },

  /**
   * Get a specific permission by ID
   * @param id Permission ID
   * @returns Promise with permission details
   */
  getPermission: async (id: number) => {
    return httpClient.get(endpoints.permissions.byId(id));
  },

  /**
   * Create a new permission
   * @param permissionData Permission data to create
   * @returns Promise with created permission
   */
  createPermission: async (permissionData: PermissionCreateData) => {
    return httpClient.post(endpoints.permissions.base, permissionData);
  },

  /**
   * Update an existing permission
   * @param id Permission ID to update
   * @param permissionData Permission data to update
   * @returns Promise with updated permission
   */
  updatePermission: async (
    id: number,
    permissionData: PermissionUpdateData,
  ) => {
    return httpClient.put(endpoints.permissions.byId(id), permissionData);
  },

  /**
   * Delete a permission
   * @param id Permission ID to delete
   * @returns Promise with deletion result
   */
  deletePermission: async (id: number) => {
    return httpClient.delete(endpoints.permissions.byId(id));
  },

  /**
   * Get permissions by category
   * @param category Category name
   * @returns Promise with permissions filtered by category
   */
  getPermissionsByCategory: async (category: string) => {
    return httpClient.get(endpoints.permissions.byCategory(category));
  },
};

export default permissionService;
