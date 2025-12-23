// src/pages/AccountPage.tsx
import { useAuth } from "../auth/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi Cuenta</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Perfil */}
        <div className="p-6 md:p-8 flex items-center gap-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-[#1f476e] text-white flex items-center justify-center text-3xl font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {(user as any)?.name || user?.email?.split('@')[0] || "Usuario"}
            </h2>
            <p className="text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Contenido (Tabs simulados por ahora) */}
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Datos Personales</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  disabled
                  defaultValue={(user as any)?.name || ""}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  disabled
                  defaultValue={user?.email || ""}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Preferencias</h3>
            <p className="text-sm text-slate-500">Configuración de idioma y notificaciones (Próximamente).</p>
          </section>

          <div className="pt-4 flex justify-end">
            <button className="px-4 py-2 bg-[#1f476e] text-white rounded-lg hover:bg-[#163a5c] transition">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
