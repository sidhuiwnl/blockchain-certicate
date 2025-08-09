import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'institution' | 'verifier';
  institutionName?: string;
  companyName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    setLoading(true);
    
    // Demo users for different roles
    const demoUsers = [
      {
        id: '1',
        email: 'student@demo.com',
        name: 'Alice Johnson',
        role: 'student' as const,
        password: 'demo123'
      },
      {
        id: '2',
        email: 'institution@demo.com',
        name: 'Dr. Michael Smith',
        role: 'institution' as const,
        institutionName: 'Stanford University',
        isVerified: true,
        password: 'demo123'
      },
      {
        id: '3',
        email: 'verifier@demo.com',
        name: 'Sarah Wilson',
        role: 'verifier' as const,
        companyName: 'Google Inc.',
        password: 'demo123'
      }
    ];

    const foundUser = demoUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    // Simulate registration
    setLoading(true);
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isVerified: userData.role === 'student' ? true : false
    };
    
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};