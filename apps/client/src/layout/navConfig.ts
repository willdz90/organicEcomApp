export function getNavItems(role?: string) {
  const base = [
    { label: "Marketplace", path: "/marketplace" },
    { label: "AliExpress", path: "/aliexpress" },
  ];

  if (!role) return base;

  if (role === "VIEWER") {
    return [
      ...base,
      { label: "Mi panel", path: "/dashboard" },
    ];
  }

  if (role === "DATA_ENTRY" || role === "ANALYST") {
    return [
      ...base,
      { label: "Dashboard", path: "/dashboard" },
      { label: "Productos", path: "/admin/products" },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...base,
      { label: "Dashboard", path: "/dashboard" },
      { label: "Productos", path: "/admin/products" },
      { label: "Usuarios", path: "/admin/users" }, // futuro
    ];
  }

  return base;
}
