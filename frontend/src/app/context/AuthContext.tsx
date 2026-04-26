import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patron' | 'staff';
}

interface AuthContextType {
  user: User | null;
  loans: any[];
  holds: any[];
  login: (email: string, password: string) => Promise<boolean>;
  loginStaff: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, cardNumber: string, pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('library_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('library_user', JSON.stringify(data.user));
      localStorage.setItem('library_token', data.token);
      return true;
    } catch {
      return false;
    }
  };

  const loginStaff = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('library_user', JSON.stringify(data.user));
      localStorage.setItem('library_token', data.token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setLoans([]);
    setHolds([]);
    localStorage.removeItem('library_user');
    localStorage.removeItem('library_token');
  };

  const register = async (name: string, email: string, cardNumber: string, pin: string): Promise<boolean> => {
    // TODO: implement real registration
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loans, holds, login, loginStaff, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}