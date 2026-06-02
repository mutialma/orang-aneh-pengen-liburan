"use client";
import { useState, useEffect } from "react";
import { Trash2, Edit, Loader2, Users, AlertCircle, X, Save, Eye, EyeOff } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function UsersCrudPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk modal edit
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState(""); // <-- State baru untuk password
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus user");
      setUsers(users.filter((user) => user.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(""); // Reset password jadi kosong setiap buka modal
    setShowPassword(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editingUser.id, 
          name: editName, 
          email: editEmail,
          password: editPassword // <-- Kirim password ke backend
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan");

      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, name: editName, email: editEmail } : u
      ));
      
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sky-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Read, Update (termasuk Ganti Password), dan Delete</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-gray-100">
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Tanggal Daftar</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition">
                <td className="p-4 font-medium text-gray-800">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEditModal(user)} className="p-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit + Ganti Password */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">Edit Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition"
                  required
                />
              </div>

              {/* Input Password Baru */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password Baru <span className="text-xs font-normal text-gray-400">(Kosongkan jika tidak diubah)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition flex items-center justify-center gap-2 disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}