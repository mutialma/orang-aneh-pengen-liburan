// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan Anda punya file ini untuk inisialisasi PrismaClient
import { authUtils } from "@/lib/auth-utils"; // Pastikan path ini sesuai dengan file algoritma kustom Anda

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Menggunakan algoritma hash kustom Anda
    const securePassword = await authUtils.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: securePassword,
      },
    });

    return NextResponse.json({ 
      message: "Registrasi berhasil",
      user: { id: user.id, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error); // Berguna untuk debugging
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}