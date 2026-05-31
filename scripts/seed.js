const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const users = [
  { email: 'alice@example.com', name: 'Alice Admin', password: 'Password123!', role: 'HR' },
  { email: 'bob@example.com', name: 'Bob Supervisor', password: 'Supervisor123!', role: 'SUPERVISOR' },
  { email: 'carol@example.com', name: 'Carol Employee', password: 'Employee123!', role: 'EMPLOYEE' },
];

async function main() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);

    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: hash },
      create: { email: u.email, name: u.name, role: u.role, password: hash },
    });

    console.log(`Upserted user: ${result.email} (id: ${result.id}, role: ${result.role})`);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
