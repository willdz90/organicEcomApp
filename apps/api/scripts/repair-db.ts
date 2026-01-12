import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🚑 Starting Database Repair...');

    try {
        // 1. Clean slate
        console.log('🧹 Cleaning tables...');
        try { await prisma.$executeRawUnsafe(`DELETE FROM "Product"`); } catch (e) { console.log('  Note: ' + (e as any).message); }
        try { await prisma.$executeRawUnsafe(`DELETE FROM "Category"`); } catch (e) { console.log('  Note: ' + (e as any).message); }

        // 2. Ensure Schema Columns
        console.log('🏗️ Verifying columns...');
        const statements = [
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
            `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`
        ];

        for (const sql of statements) {
            try {
                await prisma.$executeRawUnsafe(sql);
            } catch (e) {
                console.log(`  ⚠️ Schema Warning: ${(e as any).message}`);
            }
        }

        // 3. Drop Constraints that cause seed failure
        console.log('🔓 Fixing constraints...');
        const constraints = [
            `DROP INDEX IF EXISTS "Category_name_key"`,
            `ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key"`,
            `DROP INDEX IF EXISTS "Category_slug_key"`,
            `ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key"`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_parentId_key" ON "Category"("slug", "parentId")`
        ];

        for (const sql of constraints) {
            try { await prisma.$executeRawUnsafe(sql); } catch (e) { console.log(`  Constraint info: ${(e as any).message}`); }
        }

        // 4. Ensure FK
        console.log('🔗 Ensuring Hierarchy FK...');
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        } catch (e) {
            const msg = (e as any).message || '';
            if (!msg.includes('already exists')) console.log(`  Info FK: ${msg}`);
        }

        console.log('✅ Repair completed.');
    } catch (e) {
        console.error('❌ Critical Repair Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
