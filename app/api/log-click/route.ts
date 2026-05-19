// app/api/log-click/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { destinationId, destinationName } = await req.json();

    if (!destinationId) {
      return NextResponse.json({ success: false, error: "ID Destinasi wajib diisi" }, { status: 400 });
    }

    // Gunakan upsert: Jika ID hotel sudah ada, tambahkan clickCount + 1. Jika belum, buat data baru (klik = 1)
    const traffic = await prisma.destinationClick.upsert({
      where: { destinationId: String(destinationId) },
      update: { clickCount: { increment: 1 } },
      create: {
        destinationId: String(destinationId),
        destinationName: destinationName,
        clickCount: 1
      }
    });

    return NextResponse.json({ success: true, currentClicks: traffic.clickCount });
  } catch (error) {
    console.error("Gagal mencatat log klik:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}