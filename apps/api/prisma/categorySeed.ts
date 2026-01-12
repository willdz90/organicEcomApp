import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTA: Este seed solo funcionará DESPUÉS de aplicar la migración SQL en Render
// Para ejecutar: npx ts-node prisma/categorySeed.ts

export const CATEGORIES_HIERARCHY = [
    {
        name: "Electrónica",
        slug: "electronica",
        icon: "💻",
        order: 1,
        children: [
            { name: "Gadgets electrónicos", slug: "gadgets-electronicos", order: 1 },
            { name: "Accesorios para celulares", slug: "accesorios-celulares", order: 2 },
            { name: "Audio y video", slug: "audio-video", order: 3 },
            { name: "Smart devices / Smart home", slug: "smart-devices", order: 4 },
            { name: "Computadores y accesorios", slug: "computadores", order: 5 },
            { name: "Gaming y consolas", slug: "gaming", order: 6 },
            { name: "Proyectores y pantallas", slug: "proyectores", order: 7 },
            { name: "Cámaras y fotografía", slug: "camaras", order: 8 },
        ]
    },
    {
        name: "Hogar y Cocina",
        slug: "hogar-cocina",
        icon: "🏠",
        order: 2,
        children: [
            { name: "Decoración del hogar", slug: "decoracion", order: 1 },
            { name: "Organización y almacenamiento", slug: "organizacion", order: 2 },
            { name: "Utensilios de cocina", slug: "utensilios-cocina", order: 3 },
            { name: "Iluminación", slug: "iluminacion", order: 4 },
            { name: "Textiles para el hogar", slug: "textiles", order: 5 },
            { name: "Muebles pequeños", slug: "muebles-pequenos", order: 6 },
            { name: "Limpieza del hogar", slug: "limpieza", order: 7 },
        ]
    },
    {
        name: "Salud y Belleza",
        slug: "salud-belleza",
        icon: "💄",
        order: 3,
        children: [
            { name: "Cuidado personal", slug: "cuidado-personal", order: 1 },
            { name: "Cuidado de la piel (skincare)", slug: "skincare", order: 2 },
            { name: "Maquillaje", slug: "maquillaje", order: 3 },
            { name: "Cuidado capilar", slug: "cuidado-capilar", order: 4 },
            { name: "Bienestar y relajación", slug: "bienestar", order: 5 },
            { name: "Aparatos de masaje", slug: "masaje", order: 6 },
            { name: "Salud sexual", slug: "salud-sexual", order: 7 },
            { name: "Fitness y rehabilitación", slug: "fitness-rehab", order: 8 },
        ]
    },
    {
        name: "Moda y Accesorios",
        slug: "moda-accesorios",
        icon: "👗",
        order: 4,
        children: [
            { name: "Ropa para hombre", slug: "ropa-hombre", order: 1 },
            { name: "Ropa para mujer", slug: "ropa-mujer", order: 2 },
            { name: "Ropa infantil", slug: "ropa-infantil", order: 3 },
            { name: "Calzado", slug: "calzado", order: 4 },
            { name: "Bolsos y mochilas", slug: "bolsos", order: 5 },
            { name: "Joyería", slug: "joyeria", order: 6 },
            { name: "Relojes", slug: "relojes", order: 7 },
            { name: "Accesorios de moda", slug: "accesorios-moda", order: 8 },
        ]
    },
    {
        name: "Deportes y Aire Libre",
        slug: "deportes",
        icon: "⚽",
        order: 5,
        children: [
            { name: "Fitness y entrenamiento", slug: "fitness", order: 1 },
            { name: "Camping y senderismo", slug: "camping", order: 2 },
            { name: "Ciclismo", slug: "ciclismo", order: 3 },
            { name: "Deportes acuáticos", slug: "deportes-acuaticos", order: 4 },
            { name: "Yoga y pilates", slug: "yoga", order: 5 },
            { name: "Deportes extremos", slug: "deportes-extremos", order: 6 },
            { name: "Accesorios deportivos", slug: "accesorios-deportivos", order: 7 },
        ]
    },
    {
        name: "Juguetes y Juegos",
        slug: "juguetes",
        icon: "🧸",
        order: 6,
        children: [
            { name: "Juguetes educativos", slug: "educativos", order: 1 },
            { name: "Juguetes para bebés", slug: "bebes", order: 2 },
            { name: "Juegos de mesa", slug: "juegos-mesa", order: 3 },
            { name: "Figuras de acción", slug: "figuras-accion", order: 4 },
            { name: "Juguetes coleccionables", slug: "coleccionables", order: 5 },
            { name: "Juguetes electrónicos", slug: "electronicos", order: 6 },
        ]
    },
    {
        name: "Bebés y Niños",
        slug: "bebes-ninos",
        icon: "👶",
        order: 7,
        children: [
            { name: "Ropa para bebé", slug: "ropa-bebe", order: 1 },
            { name: "Alimentación infantil", slug: "alimentacion", order: 2 },
            { name: "Cuidado del bebé", slug: "cuidado-bebe", order: 3 },
            { name: "Juguetes para bebés", slug: "juguetes-bebe", order: 4 },
            { name: "Cochecitos y accesorios", slug: "cochecitos", order: 5 },
            { name: "Seguridad infantil", slug: "seguridad", order: 6 },
        ]
    },
    {
        name: "Automotriz",
        slug: "automotriz",
        icon: "🚗",
        order: 8,
        children: [
            { name: "Accesorios para autos", slug: "accesorios-auto", order: 1 },
            { name: "Herramientas automotrices", slug: "herramientas", order: 2 },
            { name: "Electrónica para vehículos", slug: "electronica-vehiculos", order: 3 },
            { name: "Iluminación automotriz", slug: "iluminacion-auto", order: 4 },
            { name: "Limpieza y cuidado del auto", slug: "limpieza-auto", order: 5 },
            { name: "Repuestos básicos", slug: "repuestos", order: 6 },
        ]
    },
    {
        name: "Oficina y Papelería",
        slug: "oficina-papeleria",
        icon: "📝",
        order: 9,
        children: [
            { name: "Material de oficina", slug: "material-oficina", order: 1 },
            { name: "Papelería", slug: "papeleria", order: 2 },
            { name: "Organización de escritorio", slug: "organizacion-escritorio", order: 3 },
            { name: "Muebles de oficina", slug: "muebles-oficina", order: 4 },
            { name: "Impresoras y consumibles", slug: "impresoras", order: 5 },
            { name: "Accesorios para estudio", slug: "accesorios-estudio", order: 6 },
        ]
    },
    {
        name: "Mascotas",
        slug: "mascotas",
        icon: "🐾",
        order: 10,
        children: [
            { name: "Alimentos para mascotas", slug: "alimentos", order: 1 },
            { name: "Accesorios para mascotas", slug: "accesorios-mascotas", order: 2 },
            { name: "Juguetes para mascotas", slug: "juguetes-mascotas", order: 3 },
            { name: "Higiene y cuidado", slug: "higiene", order: 4 },
            { name: "Camas y transportadoras", slug: "camas-transportadoras", order: 5 },
            { name: "Entrenamiento de mascotas", slug: "entrenamiento", order: 6 },
        ]
    },
    {
        name: "Arte, Manualidades y Hobby",
        slug: "arte-manualidades",
        icon: "🎨",
        order: 11,
        children: [
            { name: "Materiales de arte", slug: "materiales-arte", order: 1 },
            { name: "Manualidades DIY", slug: "diy", order: 2 },
            { name: "Costura y bordado", slug: "costura", order: 3 },
            { name: "Pintura y dibujo", slug: "pintura", order: 4 },
            { name: "Scrapbooking", slug: "scrapbooking", order: 5 },
            { name: "Instrumentos musicales", slug: "instrumentos", order: 6 },
        ]
    },
    {
        name: "Libros y Educación",
        slug: "libros-educacion",
        icon: "📚",
        order: 12,
        children: [
            { name: "Libros físicos", slug: "libros-fisicos", order: 1 },
            { name: "Ebooks", slug: "ebooks", order: 2 },
            { name: "Cursos online", slug: "cursos", order: 3 },
            { name: "Plantillas digitales", slug: "plantillas", order: 4 },
            { name: "Agendas y planners", slug: "agendas", order: 5 },
            { name: "Recursos educativos", slug: "recursos-educativos", order: 6 },
        ]
    },
    {
        name: "Regalos y Ocasiones",
        slug: "regalos",
        icon: "🎁",
        order: 13,
        children: [
            { name: "Regalos personalizados", slug: "personalizados", order: 1 },
            { name: "Regalos religiosos", slug: "religiosos", order: 2 },
            { name: "Regalos románticos", slug: "romanticos", order: 3 },
            { name: "Regalos corporativos", slug: "corporativos", order: 4 },
            { name: "Regalos para fechas especiales", slug: "fechas-especiales", order: 5 },
            { name: "Souvenirs", slug: "souvenirs", order: 6 },
        ]
    },
    {
        name: "Jardín y Exterior",
        slug: "jardin-exterior",
        icon: "🌱",
        order: 14,
        children: [
            { name: "Herramientas de jardín", slug: "herramientas-jardin", order: 1 },
            { name: "Decoración exterior", slug: "decoracion-exterior", order: 2 },
            { name: "Plantas artificiales", slug: "plantas", order: 3 },
            { name: "Iluminación exterior", slug: "iluminacion-exterior", order: 4 },
            { name: "Riego", slug: "riego", order: 5 },
            { name: "Muebles de exterior", slug: "muebles-exterior", order: 6 },
        ]
    },
    {
        name: "Industrial y Herramientas",
        slug: "industrial-herramientas",
        icon: "🔧",
        order: 15,
        children: [
            { name: "Herramientas eléctricas", slug: "herramientas-electricas", order: 1 },
            { name: "Herramientas manuales", slug: "herramientas-manuales", order: 2 },
            { name: "Equipos de seguridad", slug: "seguridad-industrial", order: 3 },
            { name: "Suministros industriales", slug: "suministros", order: 4 },
            { name: "Ferretería", slug: "ferreteria", order: 5 },
        ]
    },
];

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    for (const mainCat of CATEGORIES_HIERARCHY) {
        // Create main category
        let parent = await prisma.category.findFirst({
            where: {
                slug: mainCat.slug,
                parentId: null
            }
        });

        if (parent) {
            parent = await prisma.category.update({
                where: { id: parent.id },
                data: {
                    name: mainCat.name,
                    icon: mainCat.icon,
                    order: mainCat.order,
                    isActive: true,
                }
            });
        } else {
            parent = await prisma.category.create({
                data: {
                    name: mainCat.name,
                    slug: mainCat.slug,
                    icon: mainCat.icon,
                    order: mainCat.order,
                    isActive: true,
                }
            });
        }

        console.log(`  ✅ ${mainCat.icon} ${mainCat.name}`);

        // Create subcategories
        for (const subCat of mainCat.children) {
            let child = await prisma.category.findFirst({
                where: {
                    slug: subCat.slug,
                    parentId: parent.id
                }
            });

            if (child) {
                await prisma.category.update({
                    where: { id: child.id },
                    data: {
                        name: subCat.name,
                        order: subCat.order,
                        isActive: true,
                    }
                });
            } else {
                await prisma.category.create({
                    data: {
                        name: subCat.name,
                        slug: subCat.slug,
                        order: subCat.order,
                        parentId: parent.id,
                        isActive: true,
                    }
                });
            }
            console.log(`     → ${subCat.name}`);
        }
    }

    console.log('✅ Categories seeded successfully!');
}

async function main() {
    try {
        await seedCategories();
    } catch (error) {
        console.error('Error seeding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}
