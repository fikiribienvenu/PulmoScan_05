"use client";
/**
 * PulmoScan AI – Auth Context
 * Provides authentication state across the app.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { Doctor } from "@/types";

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, doctor: Doctor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  doctor: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedDoctor = Cookies.get("doctor");
    if (savedToken && savedDoctor) {
      try {
        setToken(savedToken);
        setDoctor(JSON.parse(savedDoctor));
      } catch {
        Cookies.remove("token");
        Cookies.remove("doctor");
      }
    }
  }, []);

  const login = (tok: string, doc: Doctor) => {
    Cookies.set("token", tok, { expires: 1 });
    Cookies.set("doctor", JSON.stringify(doc), { expires: 1 });
    setToken(tok);
    setDoctor(doc);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("doctor");
    setToken(null);
    setDoctor(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ doctor, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
