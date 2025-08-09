import { PrismaClient, WalletType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Seeding database...`);

  const hashedPassword = await bcrypt.hash('password', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@mail.com' },
    update: {},
    create: {
      email: 'test@mail.com',
      password: hashedPassword,
      name: 'Test user',
    },
  });

  console.log(`👤 Created test user: ${testUser.email}`);

  const wallets = [
    { name: 'Bank Account', type: WalletType.BANK, balance: 1000 },
    { name: 'Cash', type: WalletType.WALLET, balance: 2000 },
    { name: 'BHIM UPI LITE', type: WalletType.UPI, balance: 3000 },
  ];

  await Promise.all(
    wallets.map(async (wallet) => {
      await prisma.wallet.upsert({
        where: {
          id: `${testUser.id}-${wallet.type}`,
        },
        update: {},
        create: {
          ...wallet,
          userId: testUser.id,
        },
      });
      console.log(`💳 Created ${wallet.type} wallet: ${wallet.name}`);
    }),
  );

  const categories = [
    {
      name: 'Food & Dining',
      description: 'Restaurant meals, groceries',
      color: '#FF6B35',
      icon: 'utensils',
    },
    {
      name: 'Transportation',
      description: 'Gas, public transit, rides',
      color: '#4ECDC4',
      icon: 'car',
    },
    {
      name: 'Entertainment',
      description: 'Movies, games, streaming',
      color: '#45B7D1',
      icon: 'gamepad',
    },
    {
      name: 'Bills & Utilities',
      description: 'Electricity, internet, phone',
      color: '#F7DC6F',
      icon: 'file-text',
    },
    {
      name: 'Healthcare',
      description: 'Medical expenses, pharmacy',
      color: '#E74C3C',
      icon: 'heart',
    },
    {
      name: 'Shopping',
      description: 'Clothing, electronics, etc.',
      color: '#9B59B6',
      icon: 'shopping-bag',
    },
  ];

  await Promise.all(
    categories.map(async (category) => {
      await prisma.category.upsert({
        where: {
          name_userId: {
            name: category.name,
            userId: testUser.id,
          },
        },
        update: {},
        create: {
          ...category,
          userId: testUser.id,
        },
      });
    }),
  );
}

main()
  .catch((e) => {
    console.log(`❌ Seeding failed`, e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
