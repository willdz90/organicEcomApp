// src/config/navigation.ts
export type Role = "ADMIN" | "DATA_ENTRY" | "ANALYST" | "VIEWER";

export type NavSection = "general" | "admin" | "account";

export type NavItem = {
  id: string;
  label: string;
  path: string;
  roles: Role[];
  section: NavSection;
};

export const NAV_ITEMS: NavItem[] = [
  // 🌐 General
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    roles: ["ADMIN", "DATA_ENTRY", "ANALYST"],
    section: "general",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    path: "/marketplace",
    roles: ["ADMIN", "DATA_ENTRY", "ANALYST", "VIEWER"],
    section: "general",
  },
  {
    id: "favorites",
    label: "Favoritos",
    path: "/favorites",
    roles: ["ADMIN", "DATA_ENTRY", "ANALYST", "VIEWER"],
    section: "general",
  },

  // ⚙️ Admin
  {
    id: "admin-products",
    label: "Productos",
    path: "/admin/products",
    roles: ["ADMIN", "DATA_ENTRY"],
    section: "admin",
  },
  {
    id: "admin-users",
    label: "Usuarios",
    path: "/admin/users",
    roles: ["ADMIN"],
    section: "admin",
  },

  // 👤 Cuenta
  {
    id: "account",
    label: "Mi cuenta",
    path: "/account",
    roles: ["ADMIN", "DATA_ENTRY", "ANALYST", "VIEWER"],
    section: "account",
  },
];

// Helper para el sidebar
export function getNavSectionsForRole(role: Role | undefined) {
  if (!role) return [];

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const sections: Record<NavSection, NavItem[]> = {
    general: [],
    admin: [],
    account: [],
  };

  for (const item of items) {
    sections[item.section].push(item);
  }

  return sections;
}

// 👇 Añádelo DEBAJO de getNavSectionsForRole, sin borrar nada

// Helper plano para el AppLayout actual
export function getNavItemsForRole(rawRole?: string | null): NavItem[] {
  // Lista de roles válidos según nuestro tipo Role
  const validRoles: Role[] = ["ADMIN", "DATA_ENTRY", "ANALYST", "VIEWER"];

  if (!rawRole || !validRoles.includes(rawRole as Role)) {
    return [];
  }

  const role = rawRole as Role;

  // Para no romper nada hoy, solo usamos rutas que ya existen
  const enabledPaths = new Set([
    "/dashboard",
    "/marketplace",
    "/admin/products",
  ]);

  return NAV_ITEMS.filter(
    (item) => item.roles.includes(role) && enabledPaths.has(item.path)
  );
}
