export type Role =
  | "admin"
  | "staff-reception"
  | "staff-customer-care"
  | "guest";

export const roles = [
  "admin",
  "staff-reception",
  "staff-customer-care",
  "guest",
];

export const PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "room:create",
    "room:update",
    "room:delete",
    "room:view",

    "user:create",
    "user:update",
    "user:delete",
    "user:view",
  ],

  "staff-customer-care": [],
  "staff-reception": [],

  guest: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRole(value: any): value is Role {
  return roles.includes(value);
}

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
