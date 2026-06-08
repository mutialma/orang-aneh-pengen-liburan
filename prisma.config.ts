import "dotenv/config"; // Ini wajib berada di paling atas!
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Tambahkan flag --env-file=.env agar tsx juga dipaksa membaca file .env milikmu
    seed: "npx tsx --env-file=.env ./prisma/seed.ts",
  },
  datasource: {
    // Ambil langsung dari process.env setelah di-import di atas
    url: process.env["DATABASE_URL"],
  },
});