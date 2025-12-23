// src/layout/AppLayout.tsx
import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getNavItemsForRole, NavItem } from "../config/navigationConfig";

interface AppLayoutProps {
  children: ReactNode;
}

const navLinkBase =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";
const navLinkActive = "bg-white/10 text-white font-medium shadow-sm";
const navLinkInactive =
  "text-sky-100/70 hover:bg-white/5 hover:text-white";

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout?.();
    } catch (e) {
      console.error(e);
    }
    navigate("/login", { replace: true });
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() ?? "U";
  const navItems = getNavItemsForRole(user?.role ?? undefined);

  // Agrupar items por sección
  const itemsBySection = navItems.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Orden de secciones (opcional, para forzar que General vaya primero)
  const sectionOrder = ["General", "Gestión", "Cuenta"];
  const sortedSections = Object.keys(itemsBySection).sort((a, b) => {
    const idxA = sectionOrder.indexOf(a);
    const idxB = sectionOrder.indexOf(b);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="text-xl font-bold tracking-tight text-white">
          Organic<span className="text-[#bddec6]">Ecom</span>
        </div>
        <p className="text-xs text-sky-200/60 mt-1">
          Plataforma de estudio
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {sortedSections.map((section) => (
          <div key={section}>
            <h4 className="px-3 mb-2 text-[11px] font-bold text-sky-200/40 uppercase tracking-wider">
              {section}
            </h4>
            <div className="space-y-1">
              {itemsBySection[section].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive
                      }`
                    }
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-full bg-[#bddec6] text-[#1f476e] flex items-center justify-center text-sm font-bold border-2 border-[#1f476e]/20">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {user?.email}
              </span>
              <span className="text-[10px] text-sky-200/60 uppercase font-bold tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-[10px] p-2 rounded-lg hover:bg-white/10 text-sky-200 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#1f476e] shadow-xl z-20 shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* LADO DERECHO */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* TOP BAR MOBILE */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1f476e] text-white shadow-md z-30 sticky top-0 shrink-0">
          <div className="font-bold tracking-tight">
            Organic<span className="text-[#bddec6]">Ecom</span>
          </div>
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-1"
          >
            <span className="sr-only">Abrir menú</span>
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition ${mobileOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </header>

        {/* MENÚ MOBILE OVERLAY */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#1f476e] shadow-2xl h-full animate-in slide-in-from-left duration-200">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
