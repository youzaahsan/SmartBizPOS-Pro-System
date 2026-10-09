import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, BusinessSettings } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  currentBusiness: BusinessSettings;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  switchUserRole: (role: UserRole) => void;
  login: (email: string, password?: string, role?: UserRole) => boolean;
  logout: () => void;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;
  can: (permission: Permission) => boolean;
  isOnline: boolean;
}

export type Permission =
  | 'create_sale'
  | 'cancel_sale'
  | 'give_discount'
  | 'view_profit'
  | 'view_purchase_cost'
  | 'manage_products'
  | 'manage_customers'
  | 'manage_suppliers'
  | 'record_payments'
  | 'manage_expenses'
  | 'view_reports'
  | 'manage_staff'
  | 'backup_restore';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_sale',
    'cancel_sale',
    'give_discount',
    'view_profit',
    'view_purchase_cost',
    'manage_products',
    'manage_customers',
    'manage_suppliers',
    'record_payments',
    'manage_expenses',
    'view_reports',
    'manage_staff',
    'backup_restore',
  ],
  manager: [
    'create_sale',
    'cancel_sale',
    'give_discount',
    'view_profit',
    'view_purchase_cost',
    'manage_products',
    'manage_customers',
    'manage_suppliers',
    'record_payments',
    'manage_expenses',
    'view_reports',
  ],
  cashier: [
    'create_sale',
    'give_discount',
    'manage_customers',
    'record_payments',
  ],
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => db.get<User[]>('users') || []);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const list = db.get<User[]>('users') || [];
    return list.find((u) => u.role === 'admin') || list[0] || null;
  });
  const [currentBusiness, setCurrentBusiness] = useState<BusinessSettings>(() => {
    return db.get<BusinessSettings>('settings');
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const unsubUsers = db.subscribe('users', () => {
      const updated = db.get<User[]>('users');
      setUsers(updated);
    });
    const unsubSettings = db.subscribe('settings', () => {
      const updated = db.get<BusinessSettings>('settings');
      setCurrentBusiness(updated);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubUsers();
      unsubSettings();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const switchRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role) || {
      id: `user_${role}`,
      name: role === 'admin' ? 'Store Admin' : role === 'manager' ? 'Floor Manager' : 'Front Cashier',
      email: `${role}@smartbiz.com`,
      role,
      businessId: currentBusiness.id,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(match);
  };

  const switchUserRole = switchRole;

  const login = (email: string, _password?: string, role: UserRole = 'admin') => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // create guest session
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      businessId: currentBusiness.id,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    // switch to cashier or null
    switchRole('cashier');
  };

  const updateBusinessSettings = (updated: Partial<BusinessSettings>) => {
    const next = { ...currentBusiness, ...updated };
    setCurrentBusiness(next);
    db.set('settings', next);
  };

  const can = (permission: Permission): boolean => {
    if (!currentUser) return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentBusiness,
        users,
        setCurrentUser,
        switchRole,
        switchUserRole,
        login,
        logout,
        updateBusinessSettings,
        can,
        isOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
