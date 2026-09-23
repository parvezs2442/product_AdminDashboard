import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Admin<span className="text-brand-400">Hub</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Stage 1
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Product Management System</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* User Profile Badge */}
            <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-700/50 rounded-full py-1.5 px-3.5 shadow-sm">
              <img
                src={user.image || 'https://dummyjson.com/icon/emilys/128'}
                alt={user.firstName}
                className="w-7 h-7 rounded-full bg-slate-700 border border-brand-500/30 object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
              </div>
              <div className="hidden sm:flex items-center text-emerald-400 text-[11px] bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Auth Active
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
              title="Logout from dashboard"
              id="logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
