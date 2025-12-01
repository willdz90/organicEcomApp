// src/layout/AppLayout.tsx
import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getNavItemsForRole } from "../config/navigation";

interface AppLayoutProps {
  children: ReactNode;
}

const navLinkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors";
const navLinkActive = "bg-white/15 text-white font-semibold";
const navLinkInactive =
  "text-sky-50/80 hover:bg-white/10 hover:text-white";

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

  const userInitial =
    user?.email?.charAt(0)?.toUpperCase() ?? "U";

  // 🔹 Ahora usamos la navegación centralizada
  const navItems = getNavItemsForRole(user?.role ?? null);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-900 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#1f476e] text-white shadow-lg">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-lg font-semibold tracking-tight">
            Organic<span className="text-[#bddec6]">Ecom</span>
          </div>
          <p className="text-xs text-sky-100/80 mt-1">
            Panel de análisis de productos
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${navLinkBase} ${
                  isActive ? navLinkActive : navLinkInactive
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#bddec6] text-[#1f476e] flex items-center justify-center text-sm font-bold">
              {userInitial}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {user?.email}
              </span>
              <span className="text-[11px] text-sky-100/80">
                Rol: {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] px-2 py-1 rounded-full border border.white/30 hover:bg-white/10 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* LADO DERECHO: HEADER + CONTENIDO */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR MOBILE */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1f476e] text-white shadow">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold tracking.tight">
              Organic<span className="text-[#bddec6]">Ecom</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#bddec6] text-[#1f476e] flex items-center justify-center text-sm font-bold">
              {userInitial}
            </div>
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="w-8 h-8 flex flex-col items-center justify-center gap-1"
              aria-label="Abrir menú"
            >
              <span className="block w-5 h-[2px] bg-white rounded-full transition-transform" />
              <span className="block w-5 h-[2px] bg-white rounded-full transition-transform" />
              <span className="block w-5 h-[2px] bg-white rounded-full transition-transform" />
            </button>
          </div>
        </header>

        {/* MENÚ LATERAL MOBILE */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-0 left-0 h-full w-64 bg-[#1f476e] text-white shadow-xl flex flex-col">
              <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    Organic<span className="text-[#bddec6]">Ecom</span>
                  </div>
                  <p className="text-xs text-sky-100/80 mt-1">
                    Menú
                  </p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-sm px-2 py-1 rounded-full border border-white/40 hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `${navLinkBase} ${
                        isActive ? navLinkActive : navLinkInactive
                      }`
                    }
                  >
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex.items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#bddec6] text-[#1f476e] flex items-center justify-center text-sm font-bold">
                    {userInitial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">
                      {user?.email}
                    </span>
                    <span className="text-[11px] text-sky-100/80">
                      Rol: {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] px-2 py-1 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 px-2 md:px-4 lg:px-8 py-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
