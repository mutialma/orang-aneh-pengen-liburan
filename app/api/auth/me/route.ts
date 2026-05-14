import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Ambil cookie dari browser
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("session_token");

    // Jika tidak ada cookie, berarti user belum login
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // 2. Ambil email dari format token "email|signature"
    const [email] = tokenCookie.value.split("|");

    if (!email) {
      return NextResponse.json(
        { error: "Format token tidak valid" }, 
        { status: 401 }
      );
    }

    // 3. Cari data user di PostgreSQL melalui Prisma
    const user = await prisma.user.findUnique({
      where: { email: email },
      // CRITICAL SECURITY: Jangan pernah ambil kolom password nyahh!
      select: {
        id: true,
        name: true,
        email: true,
        // Tambahkan field lain jika ada, misal: image: true
      },
    });

    // Jika email di token ada tapi di DB tidak ada (kasus user dihapus)
    if (!user) {
      return NextResponse.json(
        { error: "User sudah tidak terdaftar" }, 
        { status: 404 }
      );
    }

    // 4. Kirim data user asli ke Frontend
    return NextResponse.json({ user });

  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" }, 
      { status: 500 }
    );
  }
}