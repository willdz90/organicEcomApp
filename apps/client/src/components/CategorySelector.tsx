import { useState, useEffect } from "react";
import { CATEGORY_HIERARCHY, type CategoryOption } from "../config/categories";
import { ChevronDown } from "lucide-react";

interface CategorySelectorProps {
    value: string;  // Current category slug (can be main or sub)
    onChange: (categorySlug: string) => void;
    required?: boolean;
}

export function CategorySelector({ value, onChange, required = false }: CategorySelectorProps) {
    const [mainCategory, setMainCategory] = useState<string>("");
    const [subCategory, setSubCategory] = useState<string>("");

    // Initialize from value prop
    useEffect(() => {
        if (!value) {
            setMainCategory("");
            setSubCategory("");
            return;
        }

        // Find if value is a main category or subcategory
        for (const main of CATEGORY_HIERARCHY) {
            if (main.value === value) {
                setMainCategory(value);
                setSubCategory("");
                return;
            }

            if (main.children) {
                const sub = main.children.find(c => c.value === value);
                if (sub) {
                    setMainCategory(main.value);
                    setSubCategory(value);
                    return;
                }
            }
        }
    }, [value]);

    // Get available subcategories based on selected main category
    const availableSubcategories: CategoryOption[] =
        mainCategory
            ? CATEGORY_HIERARCHY.find(c => c.value === mainCategory)?.children || []
            : [];

    const handleMainChange = (newMain: string) => {
        setMainCategory(newMain);
        setSubCategory(""); // Reset subcategory when main changes

        // If no subcategories, use main category as value
        const mainCat = CATEGORY_HIERARCHY.find(c => c.value === newMain);
        if (!mainCat?.children || mainCat.children.length === 0) {
            onChange(newMain);
        } else {
            // Wait for subcategory selection
            onChange("");
        }
    };

    const handleSubChange = (newSub: string) => {
        setSubCategory(newSub);
        onChange(newSub);
    };

    return (
        <div className="space-y-3">
            {/* Main Category Selector */}
            <div className="relative">
                <select
                    value={mainCategory}
                    onChange={(e) => handleMainChange(e.target.value)}
                    required={required}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                >
                    <option value="">Seleccionar categoría principal...</option>
                    {CATEGORY_HIERARCHY.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
            </div>

            {/* Subcategory Selector (only shown when main category has children) */}
            {mainCategory && availableSubcategories.length > 0 && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                    <select
                        value={subCategory}
                        onChange={(e) => handleSubChange(e.target.value)}
                        required={required}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                    >
                        <option value="">Seleccionar subcategoría...</option>
                        {availableSubcategories.map((subCat) => (
                            <option key={subCat.value} value={subCat.value}>
                                → {subCat.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                </div>
            )}

            {/* Helper text */}
            {mainCategory && availableSubcategories.length > 0 && !subCategory && (
                <p className="text-xs text-amber-600 ml-1 animate-in fade-in duration-200">
                    ⚠️ Selecciona una subcategoría para continuar
                </p>
            )}
        </div>
    );
}
