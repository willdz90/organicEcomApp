// src/pages/AdminProductEdit.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm, { type ProductFormData } from "../components/ProductForm";

export default function AdminProductEdit() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);
    const [loadingFetch, setLoadingFetch] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);

    // Fetch product data on mount
    useEffect(() => {
        if (!id) return;
        setLoadingFetch(true);
        api.get(`/products/${id}`)
            .then((res) => {
                const p = res.data;
                // Transform API data to Form data
                setInitialData({
                    title: p.title,
                    description: p.description || "",
                    category: p.category?.name || p.metrics?.categoryLabel || "",
                    countryGroups: p.countryGroups || ["GENERAL"],
                    cost: String(p.cost || ""),
                    sellPrice: String(p.sellPrice || ""),
                    supplierUrls: p.supplierUrls || [],
                    socialUrls: p.socialUrls || [],
                    images: p.images || [],
                    whyGood: p.whyGood || "",
                    filmingApproach: p.filmingApproach || "",
                    marketingAngles: p.marketingAngles || "",
                    status: p.status,
                    ratingAvg: String(p.ratingAvg || ""),
                });
            })
            .catch((err) => {
                console.error("Error fetching product", err);
                alert("Error cargando el producto");
                navigate("/admin/products");
            })
            .finally(() => setLoadingFetch(false));
    }, [id, navigate]);

    // Solo ADMIN / DATA_ENTRY / ANALYST pueden editar (Analyst?? Segun roles doc, Analyst puede ver? Admin/DataEntry update)
    // Re-checking roles doc: Products (Admin) -> ACCESS: ADMIN, DATA_ENTRY. (Analyst usually Read Only for metrics). 
    // Let's stick to ADMIN/DATA_ENTRY for editing as per controller guard.
    if (!user || !["ADMIN", "DATA_ENTRY"].includes(user.role || "")) {
        return <Navigate to="/dashboard" />;
    }

    const handleUpdate = async (data: ProductFormData) => {
        setLoadingSave(true);
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

            if (data.ratingAvg !== undefined && String(data.ratingAvg).trim() !== "") {
                payload.ratingAvg = Number(data.ratingAvg);
            }

            if (data.category && data.category.trim() !== "") {
                payload.metrics = {
                    categoryLabel: data.category,
                };
            }

            await api.patch(`/products/${id}`, payload);
            navigate("/admin/products");
        } catch (err: any) {
            console.error("Error updating product", err?.response || err);
            alert("No se pudo actualizar el producto.");
        } finally {
            setLoadingSave(false);
        }
    };

    if (loadingFetch) {
        return <div className="p-8 text-center text-slate-500">Cargando datos del producto...</div>;
    }

    return (
        <div className="space-y-6">
            <ProductForm
                initialData={initialData || undefined}
                onSubmit={handleUpdate}
                loading={loadingSave}
                submitLabel="Guardar Cambios"
                pageTitle="Editar Producto"
                pageSubtitle="Modifica la información y ajustes del producto"
            />
        </div>
    );
}
