// src/pages/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { Search, Shield, User, X, Check, Mail } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    role: string;
    plan: string;
    createdAt: string;
    isActive: boolean;
    name?: string;
    country?: string;
}

const ROLES = ["ADMIN", "ANALYST", "DATA_ENTRY", "VIEWER", "AUDITOR", "IT_SUPPORT"];
const PLANS = ["FREE", "PRO", "ENTERPRISE"];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    // Modals State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Error loading users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // --- Actions ---
    const handleEditClick = (u: UserData) => {
        setEditingUser({ ...u }); // Copy
        setIsEditOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            await api.patch(`/users/${editingUser.id}`, {
                role: editingUser.role,
                plan: editingUser.plan,
                isActive: editingUser.isActive,
                name: editingUser.name,
                country: editingUser.country
            });
            alert("Usuario actualizado correctamente");
            setIsEditOpen(false);
            setEditingUser(null);
            load();
        } catch (err) {
            alert("Error al actualizar usuario");
            console.error(err);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            const res = await api.post("/users/invite", { email: inviteEmail });
            alert(`Invitación enviada! Pass temporal (Simulado): ${res.data.tempPassword}`);
            setIsInviteOpen(false);
            setInviteEmail("");
            load();
        } catch (err) {
            alert("Error al invitar usuario (Quizás ya existe)");
        }
    };

    const filtered = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <UsersIcon className="text-[#1f476e]" />
                    Gestión de Usuarios
                </h1>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-[#1f476e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#163a5c] transition flex items-center gap-2"
                >
                    <Mail className="w-4 h-4" />
                    Invitar Usuario
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-t-xl border-b border-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por email..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando usuarios...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No se encontraron usuarios.</td></tr>
                        ) : (
                            filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#1f476e] font-bold text-xs">
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{u.email}</div>
                                                {u.name && <div className="text-xs text-slate-400">{u.name}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'ANALYST' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">{u.plan}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-full">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditClick(u)}
                                            className="text-[#1f476e] hover:text-[#163a5c] font-medium text-xs hover:underline"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL EDITAR --- */}
            {isEditOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Editar Usuario</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Email Readonly */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input
                                    disabled
                                    value={editingUser.email}
                                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                                    <input
                                        value={editingUser.name || ""}
                                        onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">País</label>
                                    <input
                                        value={editingUser.country || ""}
                                        onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                                        placeholder="Ej. Colombia"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan</label>
                                    <select
                                        value={editingUser.plan}
                                        onChange={e => setEditingUser({ ...editingUser, plan: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                                    >
                                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingUser.isActive}
                                        onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#1f476e] rounded focus:ring-[#1f476e]"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Usuario Activo</span>
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="px-4 py-2 bg-[#1f476e] text-white text-sm font-medium rounded-lg hover:bg-[#163a5c] transition flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL INVITAR --- */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Invitar Nuevo Usuario</h3>
                            <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                El usuario recibirá una notificación (simulada) para activar su cuenta.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email del usuario</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1f476e]/20 outline-none"
                                    placeholder="usuario@ejemplo.com"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleInvite}
                                className="px-4 py-2 bg-[#1f476e] text-white text-sm font-medium rounded-lg hover:bg-[#163a5c] transition flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Enviar Invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    );
}

