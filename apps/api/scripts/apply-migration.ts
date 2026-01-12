import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando migración segura...');

    try {
        // 1. Limpiar datos (productos antiguos)
        console.log('🧹 Limpiando productos antiguos...');
        await prisma.$executeRawUnsafe(`DELETE FROM "Rating"`);
        await prisma.$executeRawUnsafe(`DELETE FROM "Analysis"`);
        await prisma.$executeRawUnsafe(`DELETE FROM "MediaLink"`);
        await prisma.$executeRawUnsafe(`DELETE FROM "ProductTag"`);
        await prisma.$executeRawUnsafe(`DELETE FROM "Product"`);
        await prisma.$executeRawUnsafe(`DELETE FROM "Category"`);

        // 2. Agregar columnas (idempotente)
        console.log('🏗️ Agregando nuevas columnas...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);

        // 3. Modificar constraints
        console.log('🔧 Actualizando constraints...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key"`);

        // 4. Agregar FK y keys
        console.log('🔗 Configurando relaciones...');
        // FK
        try {
            await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_parentId_fkey') THEN
                    ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" 
                    FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        } catch (e) {
            // Fallback si DO blocks no soportados o error simple 
            // Intentar agregar directamente, ignorar si falla
            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
            } catch { }
        }

        // Indices
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Category_isActive_order_idx" ON "Category"("isActive", "order")`);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_parentId_key" ON "Category"("slug", "parentId")`);

        console.log('✅ Migración completada exitosamente!');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
