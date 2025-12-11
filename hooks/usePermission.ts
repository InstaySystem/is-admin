import { useAppStore } from "@/stores/useAppStore";
import { hasPermission, isRole, Role } from "@/config/permission";

export function usePermission() {
  const rawRole = useAppStore((s) => s._role);

  const role: Role = isRole(rawRole) ? rawRole : "guest";

  return {
    role,

    can: (permission: string) => hasPermission(role, permission),

    canAny: (permissions: string[]) =>
      permissions.some((p) => hasPermission(role, p)),

    canAll: (permissions: string[]) =>
      permissions.every((p) => hasPermission(role, p)),
  };
}
