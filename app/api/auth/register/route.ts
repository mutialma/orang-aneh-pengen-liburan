import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authUtils } from "@/lib/auth-utils";

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

    // PBKDF2 Hashing nyahh!
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}