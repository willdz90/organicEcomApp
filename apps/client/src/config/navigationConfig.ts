// apps/client/src/config/navigationConfig.ts
import {
    LayoutDashboard,
    Store,
    Package,
    Users,
    Settings,
    ShieldCheck,
    UserCircle,
    ShoppingBag,
    type LucideIcon,
} from "lucide-react";

export type UserRole = "ADMIN" | "ANALYST" | "DATA_ENTRY" | "VIEWER" | "AUDITOR" | "IT_SUPPORT";

export interface NavItem {
    label: string;
    path: string;
    icon?: LucideIcon;
    roles?: UserRole[]; // Si no se define, es para todos
    section?: string; // Para agrupar en el sidebar
}

export const NAVIGATION_CONFIG: NavItem[] = [
    // --- GENERAL ---
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        // Todos pueden ver dashboard, aunque el contenido varíe
        roles: ["ADMIN", "ANALYST", "DATA_ENTRY", "VIEWER", "AUDITOR", "IT_SUPPORT"],
        section: "General",
    },
    {
        label: "Marketplace",
        path: "/marketplace",
        icon: Store,
        // IT_SUPPORT no necesita ver marketplace según doc, pero VIEWER/AUDITOR si
        roles: ["ADMIN", "ANALYST", "DATA_ENTRY", "VIEWER", "AUDITOR"],
        section: "General",
    },
    {
        label: "AliExpress",
        path: "/aliexpress",
        icon: ShoppingBag,
        // Todos pueden ver el catálogo de AliExpress
        roles: ["ADMIN", "ANALYST", "DATA_ENTRY", "VIEWER", "AUDITOR"],
        section: "General",
    },

    // --- GESTIÓN (Roles operativos/admin/auditoría) ---
    {
        label: "Productos",
        path: "/admin/products",
        icon: Package,
        // AUDITOR puede ver, otros gestionar
        roles: ["ADMIN", "ANALYST", "DATA_ENTRY", "AUDITOR"],
        section: "Gestión",
    },
    {
        label: "Usuarios",
        path: "/admin/users",
        icon: Users,
        // IT_SUPPORT y AUDITOR también acceden a usuarios (lectura/soporte)
        roles: ["ADMIN", "IT_SUPPORT", "AUDITOR"],
        section: "Gestión",
    },
    {
        label: "Ajustes",
        path: "/admin/settings",
        icon: Settings,
        roles: ["ADMIN"],
        section: "Gestión",
    },

    // --- CUENTA (Todos) ---
    {
        label: "Mi Perfil",
        path: "/account",
        icon: UserCircle,
        section: "Cuenta",
    },
    {
        label: "Seguridad",
        path: "/account/security",
        icon: ShieldCheck,
        section: "Cuenta",
    },
];

// Helper para filtrar items según el rol del usuario
export function getNavItemsForRole(role?: string): NavItem[] {
    if (!role) return [];
    const r = role as UserRole;

    return NAVIGATION_CONFIG.filter((item) => {
        // Si no tiene roles definidos, es público para cualquier usuario logueado
        if (!item.roles || item.roles.length === 0) return true;
        // Si tiene roles, verificamos si el usuario lo tiene
        return item.roles.includes(r);
    });
}
