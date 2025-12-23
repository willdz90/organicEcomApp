import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";
import { ReportBuilderModal } from "../components/dashboard/ReportBuilderModal";
import { Settings, Plus, RotateCcw, Save } from "lucide-react";
import { toast } from "react-toastify";

const DEFAULT_LAYOUT = [
  { i: 'total_products', x: 0, y: 0, w: 3, h: 1 },
  { i: 'winner_rate', x: 3, y: 0, w: 3, h: 1 },
  { i: 'media_coverage', x: 6, y: 0, w: 3, h: 1 },
  { i: 'avg_price', x: 9, y: 0, w: 3, h: 1 },
  { i: 'cat_dist', x: 0, y: 1, w: 4, h: 3 },
  { i: 'country_dist', x: 4, y: 1, w: 4, h: 3 },
  { i: 'verdict_dist', x: 8, y: 1, w: 4, h: 3 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [layout, setLayout] = useState<any[]>(DEFAULT_LAYOUT);
  const [customWidgets, setCustomWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDashboard = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [statsRes, configRes] = await Promise.all([
        api.get("/analytics/stats"),
        api.get("/analytics/dashboard")
      ]);

      setData(statsRes.data);
      if (configRes.data?.layout && Array.isArray(configRes.data.layout)) {
        setLayout(configRes.data.layout);
      }
      if (configRes.data?.widgets) {
        // configRes.data.widgets might be an object or array depending on implementation
        setCustomWidgets(Array.isArray(configRes.data.widgets) ? configRes.data.widgets : Object.values(configRes.data.widgets));
      }
    } catch (err) {
      console.error("Error loading dashboard", err);
      setData(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSaveLayout = async (newLayout?: any[], newWidgets?: any[]) => {
    try {
      setSaving(true);
      const layoutToSave = newLayout || layout;
      const widgetsToSave = newWidgets || customWidgets;
      await api.post("/analytics/dashboard", { layout: layoutToSave, widgets: widgetsToSave });
      setIsEditing(false);
      toast.success("Diseño guardado correctamente");
    } catch (err) {
      toast.error("Error al guardar el diseño");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomWidget = (config: any) => {
    const newWidgetId = config.id;
    const newWidgetLayout = {
      i: newWidgetId,
      x: (layout.length * 3) % 12,
      y: Infinity, // Put it at the bottom
      w: 4,
      h: 3
    };

    const updatedLayout = [...layout, newWidgetLayout];
    const updatedWidgets = [...customWidgets, config];

    setLayout(updatedLayout);
    setCustomWidgets(updatedWidgets);
    handleSaveLayout(updatedLayout, updatedWidgets);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Análisis de catálogo y métricas de validación en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition shadow-sm"
            >
              <Plus size={18} className="text-indigo-600" />
              Crear Reporte
            </button>
          )}

          {isEditing ? (
            <>
              <button
                onClick={() => { setLayout(DEFAULT_LAYOUT); setCustomWidgets([]); setIsEditing(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                title="Restablecer diseño"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => handleSaveLayout()}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
                Guardar Diseño
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition"
            >
              <Settings size={18} />
              Personalizar
            </button>
          )}
        </div>
      </div>

      <div className="-mx-2">
        <DashboardGrid
          data={data}
          layout={layout}
          customWidgets={customWidgets}
          onLayoutChange={setLayout}
          isEditing={isEditing}
        />
      </div>

      <ReportBuilderModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSave={handleAddCustomWidget}
      />
    </div>
  );
}

