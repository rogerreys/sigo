import { RoleService, Permission } from "@/types";

const rolePermissions: Record<RoleService, Permission[]> = {
  Administrador: [Permission.view, Permission.edit, Permission.delete],
  Gerente: [Permission.view, Permission.edit, Permission.delete],
  Personal: [Permission.view, Permission.edit],
  Visitante: [Permission.view],
};

export const hasPermission = (
  userRole: RoleService,
  permission: Permission
): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const canEdit = (userRole: RoleService): boolean => {
  return hasPermission(userRole, Permission.edit);
};

export const canDelete = (userRole: RoleService): boolean => {
  return hasPermission(userRole, Permission.delete);
};

export const canView = (userRole: RoleService): boolean => {
  return hasPermission(userRole, Permission.view);
};