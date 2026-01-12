-- ============================================
-- MIGRACIÓN SEGURA: Categorías Jerárquicas
-- Preserva: Usuarios, Preferencias
-- Borra: Productos (para recrear con categorías correctas)
-- ============================================

-- PASO 1: Borrar productos y datos relacionados
-- (Esto borra productos pero mantiene usuarios intactos)

DELETE FROM "Rating";
DELETE FROM "Analysis";
DELETE FROM "MediaLink";
DELETE FROM "ProductTag";
DELETE FROM "Product";

-- PASO 2: Borrar categorías antiguas para empezar limpio
DELETE FROM "Category";

-- PASO 3: Modificar estructura de Category para jerarquía
-- Agregar nuevas columnas
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- PASO 4: Eliminar constraints antiguas
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key";

-- PASO 5: Agregar relación padre-hijo
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PASO 6: Crear índices para performance
CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX IF NOT EXISTS "Category_isActive_order_idx" ON "Category"("isActive", "order");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_parentId_key" ON "Category"("slug", "parentId");

-- ============================================
-- VERIFICACIÓN: Lo que se preserva
-- ============================================
-- ✅ Tabla "User" - INTACTA
-- ✅ Tabla "UserPreference" - INTACTA
-- ❌ Tabla "Product" - VACÍA (para recrear)
-- ❌ Tabla "Category" - VACÍA (para poblar con seed)
-- ============================================
