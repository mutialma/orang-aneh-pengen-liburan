"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Demo accounts
const DEMO_USERS: (User & { password: string })[] = [
  { name: "Andi Traveler", email: "andi@demo.com", password: "demo123", avatar: "A" },
  { name: "Sari Wanderlust", email: "sari@demo.com", password: "demo123", avatar: "S" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setUser({ name: found.name, email: found.email, avatar: found.avatar });
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    setUser({ name, email, avatar: name[0].toUpperCase() });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
