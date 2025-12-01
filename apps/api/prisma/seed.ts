// prisma/seed.ts (en apps/api/prisma/seed.ts)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const catGeneral = await prisma.category.upsert({
    where: { slug: 'general' },
    update: {},
    create: { name: 'General', slug: 'general' },
  });

    await prisma.product.createMany({
      data: [
        {
          title: 'Organizador multiuso para cocina',
          description: 'Organizador extensible para aprovechar mejor el espacio en gabinetes y alacenas.',
          // 🔹 Antes: classification: 'Hogar',
          // 🔹 Ahora: usamos category vía categoryId (si quieres) o lo dejamos null en el seed:
          categoryId: null,

          // 🔹 Antes: countryGroup: CountryGroup.GENERAL
          // 🔹 Ahora: countryGroups: CountryGroup[]
          countryGroups: ['GENERAL'],

          cost: 10,
          sellPrice: 29.99,
          marginPct: 0, // se recalculará si quieres o lo dejas null

          images: ['https://tu-imagen-1.com'],
          supplierUrls: ['https://proveedor-1.com'],
          socialUrls: ['https://tiktok.com/tu-video-1'],

          whyGood: 'Permite optimizar el espacio en cocina sin instalación complicada.',
          filmingApproach: 'Mostrar antes/después en cajones desordenados vs organizados.',
          marketingAngles: 'Orden, limpieza, aprovechar espacios pequeños.',

          status: 'PUBLISHED',

          // ⭐ Nuevo rating agregado
          ratingAvg: 4.5,
          ratingCount: 12,
        },
        {
          title: 'Lámpara decorativa minimalista',
          description: 'Lámpara LED decorativa con diseño moderno para salón o dormitorio.',
          categoryId: null,
          countryGroups: ['COD_LATAM', 'GENERAL'],
          cost: 15,
          sellPrice: 39.99,
          marginPct: 0,
          images: ['https://tu-imagen-2.com'],
          supplierUrls: ['https://proveedor-2.com'],
          socialUrls: ['https://instagram.com/tu-video-2'],
          whyGood: 'Añade luz ambiental y estilo sin ocupar mucho espacio.',
          filmingApproach: 'Ambientes antes/después con y sin la lámpara, enfoque en mood.',
          marketingAngles: 'Decoración, ambiente acogedor, regalo perfecto.',
          status: 'PUBLISHED',
          ratingAvg: 4.8,
          ratingCount: 25,
        },
      ],
    });

}

main().then(() => prisma.$disconnect());
