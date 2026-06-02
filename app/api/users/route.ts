import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authUtils } from "@/lib/auth-utils"; // Tambahkan ini untuk men-hash password baru

// READ: (Tetap sama seperti sebelumnya)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// UPDATE: Mengubah nama, email, dan password (opsional)
export async function PUT(req: Request) {
  try {
    const { id, name, email, password } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Siapkan data yang akan diupdate
    const updateData: any = { name, email };

    // JIKA password diisi, validasi dan hash menggunakan formula kustom Anda
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
      }
      
      // Enkripsi dengan rumus: h(k) = ( Σ ASCII[i] × (i+1) × salt ) mod P
      const securePassword = await authUtils.hashPassword(password);
      updateData.password = securePassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "User berhasil diupdate", user: updatedUser });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate data" }, { status: 500 });
  }
}

// DELETE: (Tetap sama seperti sebelumnya)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}