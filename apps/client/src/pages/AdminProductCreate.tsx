// src/pages/AdminProductCreate.tsx
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { Navigate, useNavigate } from "react-router-dom";
import ProductForm, { type ProductFormData } from "../components/ProductForm";

export default function AdminProductCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Solo ADMIN / DATA_ENTRY pueden crear
  if (!user || !["ADMIN", "DATA_ENTRY"].includes(user.role || "")) {
    return <Navigate to="/dashboard" />;
  }

  const handleCreate = async (data: ProductFormData) => {
    setLoadingCreate(true);
    try {
      const payload: any = {
        title: data.title,
        description: data.description,
        countryGroups: data.countryGroups,
        cost: Number(data.cost),
        sellPrice: Number(data.sellPrice),
        supplierUrls: data.supplierUrls,
        socialUrls: data.socialUrls,
        images: data.images,
        whyGood: data.whyGood,
        filmingApproach: data.filmingApproach,
        marketingAngles: data.marketingAngles,
        status: data.status,
      };

      // rating opcional
      if (data.ratingAvg !== undefined && String(data.ratingAvg).trim() !== "") {
        payload.ratingAvg = Number(data.ratingAvg);
      }

      // categoría (por ahora solo en frontend)
      if (data.category && data.category.trim() !== "") {
        payload.metrics = {
          categoryLabel: data.category,
        };
      }

      await api.post("/products", payload);
      navigate("/admin/products");
    } catch (err: any) {
      console.error("Error creando producto", err?.response || err);
      alert("No se pudo crear el producto. Revisa los datos.");
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <ProductForm
        onSubmit={handleCreate}
        loading={loadingCreate}
        submitLabel="Crear Producto"
        pageTitle="Crear producto"
        pageSubtitle="Completa la ficha técnica para registrar un nuevo item"
      />
    </div>
  );
}
