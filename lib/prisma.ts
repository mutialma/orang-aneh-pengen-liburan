import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Ambil URL database dari file .env
const connectionString = process.env.DATABASE_URL;

// Setup global object untuk mencegah kebocoran koneksi saat Next.js Hot-Reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Buat connection pool menggunakan pg
const pool = new Pool({ connectionString });

// 2. Bungkus pool tersebut menggunakan Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam PrismaClient (Ini WAJIB di Prisma v7!)
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;