// src/routes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import AdminProducts from "./pages/AdminProducts";
import AdminProductCreate from "./pages/AdminProductCreate";
import AdminProductEdit from "./pages/AdminProductEdit";
import { useAuth } from "./auth/useAuth";
import type { ReactElement } from "react";
import { AppLayout } from "./layout/AppLayout";
import AccountPage from "./pages/AccountPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import { AnalyticsDetail } from "./pages/AnalyticsDetail";



function PrivateRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Todas las rutas privadas comparten el AppLayout
  return <AppLayout>{children}</AppLayout>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas (con Layout) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />

          {/* Nueva ruta de detalle */}
          <Route path="/products/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/products" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
          <Route path="/admin/products/new" element={<PrivateRoute><AdminProductCreate /></PrivateRoute>} />
          <Route path="/admin/products/:id/edit" element={<PrivateRoute><AdminProductEdit /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />
          <Route path="/admin/analytics/detail/:id" element={<PrivateRoute><AnalyticsDetail /></PrivateRoute>} />

          {/* Cuenta */}
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
