import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.program.createMany({
    data: [
      { name: "Teología", code: "TH", description: "Programa de Teología UNAC" },
      { name: "Proyección Social", code: "PS", description: "Proyectos comunitarios y eclesiásticos" }
    ]
  });
  // ... otros seeders existentes ...
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });