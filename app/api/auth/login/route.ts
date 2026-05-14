import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authUtils } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    // Verifikasi PBKDF2 (Constant-time)
    const isValid = await authUtils.verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    // Generate Custom Session Token
    const sessionToken = authUtils.generateSessionToken(user.email);

    const response = NextResponse.json({
      message: "Login berhasil",
      user: { name: user.name, email: user.email }
    });

    // Simpan token di cookie (HTTP Only)
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}