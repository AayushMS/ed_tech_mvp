import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edunexus.com' },
    update: {},
    create: {
      email: 'admin@edunexus.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      firstNameNe: 'प्रणाली',
      lastNameNe: 'प्रशासक',
    },
  });

  // Create academic year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'ay-2081' },
    update: {},
    create: {
      id: 'ay-2081',
      name: '2081-2082',
      nameNe: '२०८१-२०८२',
      startDate: new Date('2024-04-14'),
      endDate: new Date('2025-04-13'),
      isCurrent: true,
    },
  });

  // Create subjects
  const subjects = [
    { code: 'MAT', name: 'Mathematics', nameNe: 'गणित' },
    { code: 'ENG', name: 'English', nameNe: 'अंग्रेजी' },
    { code: 'NEP', name: 'Nepali', nameNe: 'नेपाली' },
    { code: 'SCI', name: 'Science', nameNe: 'विज्ञान' },
    { code: 'SOC', name: 'Social Studies', nameNe: 'सामाजिक अध्ययन' },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
  }

  // Create grading scale
  const gradingScale = await prisma.gradingScale.upsert({
    where: { id: 'gs-cdc' },
    update: {},
    create: {
      id: 'gs-cdc',
      name: 'CDC Standard',
      isDefault: true,
      entries: {
        create: [
          { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
          { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.6 },
          { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gpa: 3.2 },
          { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gpa: 2.8 },
          { grade: 'C+', minPercentage: 50, maxPercentage: 59.99, gpa: 2.4 },
          { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpa: 2.0 },
          { grade: 'D', minPercentage: 30, maxPercentage: 39.99, gpa: 1.6 },
          { grade: 'E', minPercentage: 0, maxPercentage: 29.99, gpa: 0.0 },
        ],
      },
    },
  });

  console.log('Seed completed:', { admin: admin.email, academicYear: academicYear.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
