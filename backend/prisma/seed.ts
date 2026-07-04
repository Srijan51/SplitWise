import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create users
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Sharma",
      email: "alice@example.com",
      password,
      phone: "+91 98765 43210",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Kumar",
      email: "bob@example.com",
      password,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      name: "Charlie Singh",
      email: "charlie@example.com",
      password,
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: "diana@example.com" },
    update: {},
    create: {
      name: "Diana Patel",
      email: "diana@example.com",
      password,
    },
  });

  console.log("✅ Users created: Alice, Bob, Charlie, Diana");
  console.log(`   All passwords: password123\n`);

  // Create an ongoing group
  const hostelGroup = await prisma.group.create({
    data: {
      name: "Hostel 42 Mess",
      type: "ONGOING",
      emoji: "🍳",
      accentColor: "#6366f1",
      inviteCode: "HST42M",
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
          { userId: charlie.id, role: "MEMBER" },
          { userId: diana.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log(`✅ Group created: "${hostelGroup.name}" (code: HST42M)`);

  // Create a trip group
  const tripGroup = await prisma.group.create({
    data: {
      name: "Goa Trip 2025",
      type: "TRIP",
      emoji: "🏖️",
      accentColor: "#f97316",
      inviteCode: "GOA25X",
      startDate: new Date("2025-12-20"),
      endDate: new Date("2025-12-25"),
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
          { userId: charlie.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log(`✅ Group created: "${tripGroup.name}" (code: GOA25X)`);

  // Add some expenses to the hostel group
  const expense1 = await prisma.expense.create({
    data: {
      groupId: hostelGroup.id,
      paidById: alice.id,
      amount: 1200,
      description: "Monthly mess bill - June",
      category: "Food",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 300 },
          { userId: bob.id, amountOwed: 300 },
          { userId: charlie.id, amountOwed: 300 },
          { userId: diana.id, amountOwed: 300 },
        ],
      },
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      groupId: hostelGroup.id,
      paidById: bob.id,
      amount: 600,
      description: "Groceries from BigBasket",
      category: "Groceries",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 150 },
          { userId: bob.id, amountOwed: 150 },
          { userId: charlie.id, amountOwed: 150 },
          { userId: diana.id, amountOwed: 150 },
        ],
      },
    },
  });

  const expense3 = await prisma.expense.create({
    data: {
      groupId: hostelGroup.id,
      paidById: charlie.id,
      amount: 400,
      description: "Electricity bill",
      category: "Rent",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 100 },
          { userId: bob.id, amountOwed: 100 },
          { userId: charlie.id, amountOwed: 100 },
          { userId: diana.id, amountOwed: 100 },
        ],
      },
    },
  });

  console.log("✅ Added 3 expenses to Hostel 42 Mess");

  // Add expenses to trip group
  await prisma.expense.create({
    data: {
      groupId: tripGroup.id,
      paidById: alice.id,
      amount: 9000,
      description: "Flight tickets (3 pax)",
      category: "Travel",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 3000 },
          { userId: bob.id, amountOwed: 3000 },
          { userId: charlie.id, amountOwed: 3000 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      groupId: tripGroup.id,
      paidById: bob.id,
      amount: 4500,
      description: "Airbnb - 3 nights",
      category: "Travel",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 1500 },
          { userId: bob.id, amountOwed: 1500 },
          { userId: charlie.id, amountOwed: 1500 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      groupId: tripGroup.id,
      paidById: charlie.id,
      amount: 2100,
      description: "Beach shack dinner 🦐",
      category: "Food",
      splitType: "EQUAL",
      splits: {
        create: [
          { userId: alice.id, amountOwed: 700 },
          { userId: bob.id, amountOwed: 700 },
          { userId: charlie.id, amountOwed: 700 },
        ],
      },
    },
  });

  console.log("✅ Added 3 expenses to Goa Trip 2025");

  console.log("\n🎉 Seed completed!");
  console.log("\n📝 Login credentials:");
  console.log("   alice@example.com / password123");
  console.log("   bob@example.com   / password123");
  console.log("   charlie@example.com / password123");
  console.log("   diana@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
