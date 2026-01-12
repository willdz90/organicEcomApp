// Category hierarchy configuration for the application
// Matches the backend categorySeed.ts structure

export interface CategoryOption {
    value: string;      // slug for the category
    label: string;      // display name
    icon?: string;      // emoji icon
    children?: CategoryOption[];
}

export const CATEGORY_HIERARCHY: CategoryOption[] = [
    {
        value: "electronica",
        label: "Electrónica",
        icon: "💻",
        children: [
            { value: "gadgets-electronicos", label: "Gadgets electrónicos" },
            { value: "accesorios-celulares", label: "Accesorios para celulares" },
            { value: "audio-video", label: "Audio y video" },
            { value: "smart-devices", label: "Smart devices / Smart home" },
            { value: "computadores", label: "Computadores y accesorios" },
            { value: "gaming", label: "Gaming y consolas" },
            { value: "proyectores", label: "Proyectores y pantallas" },
            { value: "camaras", label: "Cámaras y fotografía" },
        ]
    },
    {
        value: "hogar-cocina",
        label: "Hogar y Cocina",
        icon: "🏠",
        children: [
            { value: "decoracion", label: "Decoración del hogar" },
            { value: "organizacion", label: "Organización y almacenamiento" },
            { value: "utensilios-cocina", label: "Utensilios de cocina" },
            { value: "iluminacion", label: "Iluminación" },
            { value: "textiles", label: "Textiles para el hogar" },
            { value: "muebles-pequenos", label: "Muebles pequeños" },
            { value: "limpieza", label: "Limpieza del hogar" },
        ]
    },
    {
        value: "salud-belleza",
        label: "Salud y Belleza",
        icon: "💄",
        children: [
            { value: "cuidado-personal", label: "Cuidado personal" },
            { value: "skincare", label: "Cuidado de la piel (skincare)" },
            { value: "maquillaje", label: "Maquillaje" },
            { value: "cuidado-capilar", label: "Cuidado capilar" },
            { value: "bienestar", label: "Bienestar y relajación" },
            { value: "masaje", label: "Aparatos de masaje" },
            { value: "salud-sexual", label: "Salud sexual" },
            { value: "fitness-rehab", label: "Fitness y rehabilitación" },
        ]
    },
    {
        value: "moda-accesorios",
        label: "Moda y Accesorios",
        icon: "👗",
        children: [
            { value: "ropa-hombre", label: "Ropa para hombre" },
            { value: "ropa-mujer", label: "Ropa para mujer" },
            { value: "ropa-infantil", label: "Ropa infantil" },
            { value: "calzado", label: "Calzado" },
            { value: "bolsos", label: "Bolsos y mochilas" },
            { value: "joyeria", label: "Joyería" },
            { value: "relojes", label: "Relojes" },
            { value: "accesorios-moda", label: "Accesorios de moda" },
        ]
    },
    {
        value: "deportes",
        label: "Deportes y Aire Libre",
        icon: "⚽",
        children: [
            { value: "fitness", label: "Fitness y entrenamiento" },
            { value: "camping", label: "Camping y senderismo" },
            { value: "ciclismo", label: "Ciclismo" },
            { value: "deportes-acuaticos", label: "Deportes acuáticos" },
            { value: "yoga", label: "Yoga y pilates" },
            { value: "deportes-extremos", label: "Deportes extremos" },
            { value: "accesorios-deportivos", label: "Accesorios deportivos" },
        ]
    },
    {
        value: "juguetes",
        label: "Juguetes y Juegos",
        icon: "🧸",
        children: [
            { value: "educativos", label: "Juguetes educativos" },
            { value: "bebes", label: "Juguetes para bebés" },
            { value: "juegos-mesa", label: "Juegos de mesa" },
            { value: "figuras-accion", label: "Figuras de acción" },
            { value: "coleccionables", label: "Juguetes coleccionables" },
            { value: "electronicos", label: "Juguetes electrónicos" },
        ]
    },
    {
        value: "bebes-ninos",
        label: "Bebés y Niños",
        icon: "👶",
        children: [
            { value: "ropa-bebe", label: "Ropa para bebé" },
            { value: "alimentacion", label: "Alimentación infantil" },
            { value: "cuidado-bebe", label: "Cuidado del bebé" },
            { value: "juguetes-bebe", label: "Juguetes para bebés" },
            { value: "cochecitos", label: "Cochecitos y accesorios" },
            { value: "seguridad", label: "Seguridad infantil" },
        ]
    },
    {
        value: "automotriz",
        label: "Automotriz",
        icon: "🚗",
        children: [
            { value: "accesorios-auto", label: "Accesorios para autos" },
            { value: "herramientas", label: "Herramientas automotrices" },
            { value: "electronica-vehiculos", label: "Electrónica para vehículos" },
            { value: "iluminacion-auto", label: "Iluminación automotriz" },
            { value: "limpieza-auto", label: "Limpieza y cuidado del auto" },
            { value: "repuestos", label: "Repuestos básicos" },
        ]
    },
    {
        value: "oficina-papeleria",
        label: "Oficina y Papelería",
        icon: "📝",
        children: [
            { value: "material-oficina", label: "Material de oficina" },
            { value: "papeleria", label: "Papelería" },
            { value: "organizacion-escritorio", label: "Organización de escritorio" },
            { value: "muebles-oficina", label: "Muebles de oficina" },
            { value: "impresoras", label: "Impresoras y consumibles" },
            { value: "accesorios-estudio", label: "Accesorios para estudio" },
        ]
    },
    {
        value: "mascotas",
        label: "Mascotas",
        icon: "🐾",
        children: [
            { value: "alimentos", label: "Alimentos para mascotas" },
            { value: "accesorios-mascotas", label: "Accesorios para mascotas" },
            { value: "juguetes-mascotas", label: "Juguetes para mascotas" },
            { value: "higiene", label: "Higiene y cuidado" },
            { value: "camas-transportadoras", label: "Camas y transportadoras" },
            { value: "entrenamiento", label: "Entrenamiento de mascotas" },
        ]
    },
    {
        value: "arte-manualidades",
        label: "Arte, Manualidades y Hobby",
        icon: "🎨",
        children: [
            { value: "materiales-arte", label: "Materiales de arte" },
            { value: "diy", label: "Manualidades DIY" },
            { value: "costura", label: "Costura y bordado" },
            { value: "pintura", label: "Pintura y dibujo" },
            { value: "scrapbooking", label: "Scrapbooking" },
            { value: "instrumentos", label: "Instrumentos musicales" },
        ]
    },
    {
        value: "libros-educacion",
        label: "Libros y Educación",
        icon: "📚",
        children: [
            { value: "libros-fisicos", label: "Libros físicos" },
            { value: "ebooks", label: "Ebooks" },
            { value: "cursos", label: "Cursos online" },
            { value: "plantillas", label: "Plantillas digitales" },
            { value: "agendas", label: "Agendas y planners" },
            { value: "recursos-educativos", label: "Recursos educativos" },
        ]
    },
    {
        value: "regalos",
        label: "Regalos y Ocasiones",
        icon: "🎁",
        children: [
            { value: "personalizados", label: "Regalos personalizados" },
            { value: "religiosos", label: "Regalos religiosos" },
            { value: "romanticos", label: "Regalos románticos" },
            { value: "corporativos", label: "Regalos corporativos" },
            { value: "fechas-especiales", label: "Regalos para fechas especiales" },
            { value: "souvenirs", label: "Souvenirs" },
        ]
    },
    {
        value: "jardin-exterior",
        label: "Jardín y Exterior",
        icon: "🌱",
        children: [
            { value: "herramientas-jardin", label: "Herramientas de jardín" },
            { value: "decoracion-exterior", label: "Decoración exterior" },
            { value: "plantas", label: "Plantas artificiales" },
            { value: "iluminacion-exterior", label: "Iluminación exterior" },
            { value: "riego", label: "Riego" },
            { value: "muebles-exterior", label: "Muebles de exterior" },
        ]
    },
    {
        value: "industrial-herramientas",
        label: "Industrial y Herramientas",
        icon: "🔧",
        children: [
            { value: "herramientas-electricas", label: "Herramientas eléctricas" },
            { value: "herramientas-manuales", label: "Herramientas manuales" },
            { value: "seguridad-industrial", label: "Equipos de seguridad" },
            { value: "suministros", label: "Suministros industriales" },
            { value: "ferreteria", label: "Ferretería" },
        ]
    },
];

// Helper: Get full category path for display
export function getCategoryPath(categorySlug: string | null | undefined): string {
    if (!categorySlug) return "Sin categoría";

    // Search in hierarchy
    for (const mainCat of CATEGORY_HIERARCHY) {
        // Check if it's a main category
        if (mainCat.value === categorySlug) {
            return `${mainCat.icon || ""} ${mainCat.label}`.trim();
        }

        // Check if it's a subcategory
        if (mainCat.children) {
            const subCat = mainCat.children.find(c => c.value === categorySlug);
            if (subCat) {
                return `${mainCat.icon || ""} ${mainCat.label} → ${subCat.label}`.trim();
            }
        }
    }

    return categorySlug; // Fallback to slug if not found
}

// Helper: Get category label only (no path)
export function getCategoryLabel(categorySlug: string | null | undefined): string {
    if (!categorySlug) return "Sin categoría";

    for (const mainCat of CATEGORY_HIERARCHY) {
        if (mainCat.value === categorySlug) return mainCat.label;
        if (mainCat.children) {
            const subCat = mainCat.children.find(c => c.value === categorySlug);
            if (subCat) return subCat.label;
        }
    }

    return categorySlug;
}

// Helper: Get main category from subcategory slug
export function getMainCategory(categorySlug: string | null | undefined): CategoryOption | null {
    if (!categorySlug) return null;

    for (const mainCat of CATEGORY_HIERARCHY) {
        if (mainCat.value === categorySlug) return mainCat;
        if (mainCat.children?.some(c => c.value === categorySlug)) {
            return mainCat;
        }
    }

    return null;
}

// Helper: Flatten all categories for simple selects (backward compatibility)
export function getAllCategoriesFlat(): Array<{ value: string; label: string }> {
    const flat: Array<{ value: string; label: string }> = [];

    CATEGORY_HIERARCHY.forEach(mainCat => {
        flat.push({ value: mainCat.value, label: `${mainCat.icon || ""} ${mainCat.label}`.trim() });
        mainCat.children?.forEach(subCat => {
            flat.push({ value: subCat.value, label: `  → ${subCat.label}` });
        });
    });

    return flat;
}
