import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ticketing.com' },
    update: {},
    create: {
      email: 'admin@ticketing.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'Admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create a technician user
  const techPassword = await bcrypt.hash('tech123', 10);
  const technician = await prisma.user.upsert({
    where: { email: 'tech@ticketing.com' },
    update: {},
    create: {
      email: 'tech@ticketing.com',
      password: techPassword,
      name: 'John Technician',
      role: 'Technician',
    },
  });

  console.log('✅ Technician user created:', technician.email);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
