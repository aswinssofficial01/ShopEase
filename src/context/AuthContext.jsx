import { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
// Simple client-side token utilities (base64-encoded JSON) – not for production security
const generateToken = (payload) => btoa(JSON.stringify(payload));
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
};

const JWT_SECRET = 'shopease_secret_key';

const AuthContext = createContext(null);

  const USERS_KEY = 'shopease_users';
  const CURRENT_USER_KEY = 'shopease_current_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Initialize user from JWT token if present
  useEffect(() => {
    const token = localStorage.getItem('shopease_jwt');
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded && decoded.email) {
          const { password: _, ...userData } = decoded;
          setUser(userData);
        }
      } catch (e) {
        console.error('Invalid JWT token', e);
        localStorage.removeItem('shopease_jwt');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  // Keep current user session in sync with the database record (e.g., role changes)
  useEffect(() => {
    if (user) {
      const users = getUsers();
      const dbUser = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (dbUser) {
        if (
          dbUser.role !== user.role ||
          dbUser.name !== user.name ||
          JSON.stringify(dbUser.loginHistory) !== JSON.stringify(user.loginHistory)
        ) {
          const { password: _, ...userWithoutPassword } = dbUser;
          setUser(userWithoutPassword);
        }
      }
    }
  }, [user]);

  function getUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

  const register = (name, email, password, requestedRole = 'user') => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'Email already registered' };
    }

    // Hash the password before storing
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: Date.now(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedEmail === 'admin@shopease.com' ? 'admin' : requestedRole,
      joinedAt: new Date().toISOString(),
      loginHistory: [],
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    // Generate JWT token for the new user
      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
      localStorage.setItem('shopease_jwt', token);

    return { success: true, token };
  };

  const login = (email, password) => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password using bcrypt
    const passwordMatches = bcrypt.compareSync(password, foundUser.password);
    if (!passwordMatches) {
      return { success: false, message: 'Invalid email or password' };
    }

    const now = new Date().toISOString();
    const updatedUser = { ...foundUser, lastLogin: now };
    if (normalizedEmail === 'admin@shopease.com') {
      updatedUser.role = 'admin';
    }
    updatedUser.loginHistory = (updatedUser.loginHistory || []).concat(now);

    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    const { password: _, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword);

    // Generate JWT token
      const token = generateToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name });
      localStorage.setItem('shopease_jwt', token);

    return { success: true, user: userWithoutPassword, token };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopease_jwt');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
