"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Cek status login saat pertama kali load (Check Session)
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me"); // Kita perlu buat API ini nanti
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // 2. Fungsi Login
 // Pastikan method dan path-nya sama dengan file API yang kamu buat
const login = async (email: string, password: string) => {
  try {
    const res = await fetch("/api/auth/login", { // Sesuaikan path ini
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user); // Simpan data user (nama, email) ke state
      return true;
    } else {
      // Kamu bisa melempar error agar ditangkap di catch
      throw new Error(data.error || "Gagal login");
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

  // 3. Fungsi Register
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Setelah daftar, kita langsung arahkan login
        return await login(email, password);
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // 4. Fungsi Logout
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};