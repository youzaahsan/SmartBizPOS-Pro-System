import React, { useState } from 'react';
import {
  Shield,
  User as UserIcon,
  Lock,
  X,
  CheckCircle,
  KeyRound,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUserRole, login, logout, users } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (ok) {
      onClose();
    } else {
      setError('Invalid email or password. You can also pick a demo role below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">
              Staff Login & Role Switcher
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current logged in user info */}
        {currentUser && (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-emerald-950">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-700 font-mono">
                Role: <span className="uppercase font-bold">{currentUser.role}</span> ({currentUser.email})
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {/* 1-Click Fast Role Switcher (For demo and POS switching) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            ⚡ 1-Click Demo Accounts (RBAC Test)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {users.map((u: User) => {
              const active = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUserRole(u.role);
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl text-left border transition flex flex-col justify-between ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 shadow-2xs'
                      : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900 truncate">{u.name}</div>
                  <div
                    className={`text-[10px] font-bold uppercase mt-1 ${
                      u.role === 'admin'
                        ? 'text-purple-700'
                        : u.role === 'manager'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {u.role}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-gray-400">
            * Cashier role automatically hides sensitive purchase cost prices.
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-2 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-700">Or Sign In with Credentials:</div>
          {error && <div className="text-xs text-rose-600 font-semibold">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@smartbiz.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
