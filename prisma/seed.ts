import { PrismaClient, Role, VendorStatus, RFQStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("Demo@2026", 10)

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@vendorbridge.demo" },
    update: {},
    create: {
      email: "admin@vendorbridge.demo",
      name: "Super Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  })

  const officer = await prisma.user.upsert({
    where: { email: "officer@vendorbridge.demo" },
    update: {},
    create: {
      email: "officer@vendorbridge.demo",
      name: "Procurement Officer",
      passwordHash,
      role: Role.OFFICER,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@vendorbridge.demo" },
    update: {},
    create: {
      email: "manager@vendorbridge.demo",
      name: "Finance Manager",
      passwordHash,
      role: Role.MANAGER,
    },
  })

  const vendorUser1 = await prisma.user.upsert({
    where: { email: "vendor1@vendorbridge.demo" },
    update: {},
    create: {
      email: "vendor1@vendorbridge.demo",
      name: "TechSupply Sales",
      passwordHash,
      role: Role.VENDOR,
    },
  })

  const vendorUser2 = await prisma.user.upsert({
    where: { email: "vendor2@vendorbridge.demo" },
    update: {},
    create: {
      email: "vendor2@vendorbridge.demo",
      name: "GlobalParts Rep",
      passwordHash,
      role: Role.VENDOR,
    },
  })

  console.log("Users created")

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { gstNumber: "27AAAAA0000A1Z5" },
    update: {},
    create: {
      name: "TechSupply Co.",
      categories: ["Electronics", "Hardware"],
      gstNumber: "27AAAAA0000A1Z5",
      stateCode: "27",
      status: VendorStatus.ACTIVE,
      vtsScore: 82.5,
      email: "vendor1@vendorbridge.demo",
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { gstNumber: "29BBBBB1111B2Z6" },
    update: {},
    create: {
      name: "GlobalParts Ltd.",
      categories: ["Industrial", "Logistics"],
      gstNumber: "29BBBBB1111B2Z6",
      stateCode: "29",
      status: VendorStatus.ACTIVE,
      vtsScore: 67.0,
      email: "vendor2@vendorbridge.demo",
    },
  })

  const vendor3 = await prisma.vendor.upsert({
    where: { gstNumber: "33CCCCC2222C3Z7" },
    update: {},
    create: {
      name: "LocalWorks Inc.",
      categories: ["Services", "Maintenance"],
      gstNumber: "33CCCCC2222C3Z7",
      stateCode: "33",
      status: VendorStatus.ACTIVE,
      vtsScore: 45.0,
      email: "vendor3@vendorbridge.demo",
    },
  })

  console.log("Vendors created")

  // 3. Create RFQs
  await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2025-0001",
      title: "Laptop Procurement Q3",
      description: "Need 50 high-end development laptops",
      status: RFQStatus.PUBLISHED,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdById: officer.id,
      vendorIds: [vendor1.id, vendor2.id],
      lineItems: [
        { name: "MacBook Pro 14", qty: 25, unit: "pcs", estimatedPrice: 200000 },
        { name: "Dell XPS 15", qty: 25, unit: "pcs", estimatedPrice: 180000 },
      ],
    },
  })

  await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2025-0002",
      title: "Office Furniture Set",
      description: "Desks and chairs for new floor",
      status: RFQStatus.DRAFT,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdById: officer.id,
      vendorIds: [vendor2.id, vendor3.id],
      lineItems: [
        { name: "Ergonomic Chair", qty: 100, unit: "pcs", estimatedPrice: 15000 },
        { name: "Standing Desk", qty: 50, unit: "pcs", estimatedPrice: 35000 },
      ],
    },
  })

  console.log("RFQs created")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
