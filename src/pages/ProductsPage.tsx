import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { CheckCircle2, ShieldCheck, Database, KeyRound, ArrowRight, Layers, LogOut } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user, token, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {user?.firstName}!
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Logged In
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              You are authenticated as <span className="text-slate-200 font-mono">@{user?.username}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stage 1 Verification Dashboard */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Shared Axios Client */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">Shared Axios Setup</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Configured in <span className="font-mono text-brand-300">src/lib/axios.ts</span>. Automatically injects Bearer token on all requests and centralizes error handling.
            </p>
          </div>

          {/* Card 2: Auth Route Guard */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">Protected Route Guard</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Unauthenticated users navigating to <span className="font-mono text-indigo-300">/products</span> are automatically redirected to <span className="font-mono text-indigo-300">/login</span>.
            </p>
          </div>

          {/* Card 3: Token Session */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">DummyJSON Session</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Authenticated via <span className="font-mono text-amber-300">POST /auth/login</span>. Token is safely preserved for subsequent product requests.
            </p>
          </div>
        </div>

        {/* Next Stage Readiness Banner */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-brand-950/60 to-slate-900 border border-brand-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-2">
                <Layers className="w-4 h-4" />
                <span>Stage 1 Completed Successfully</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Ready for Stage 2: Product Table & Custom Pagination
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Stage 1 establishes the full authentication pipeline, shared Axios interceptors, route security, and login error handling. Stage 2 will connect this authenticated session directly to the DummyJSON product catalog.
              </p>
            </div>
            <div className="shrink-0 flex items-center space-x-2 text-xs font-semibold px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300">
              <span>Next: Stage 2</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
