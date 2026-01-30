import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const empresas = [
    { nome: 'Grupo Focco', cor: '#3b82f6', padrao: true },
    { nome: 'People', cor: '#8b5cf6', padrao: false },
    { nome: 'MCT', cor: '#10b981', padrao: false },
  ];

  for (const emp of empresas) {
    const exists = await prisma.empresa.findFirst({
      where: { nome: emp.nome }
    });

    if (!exists) {
      await prisma.empresa.create({
        data: emp
      });
      console.log(`Created company: ${emp.nome}`);
    } else {
      console.log(`Company already exists: ${emp.nome}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
