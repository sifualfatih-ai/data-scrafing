/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Globe, 
  LayoutDashboard, 
  Search, 
  Settings,
  Cloud,
  RefreshCw,
  TrendingUp,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: 'discovery' | 'dashboard' | 'analytics' | 'settings';
  onTabChange: (tab: 'discovery' | 'dashboard' | 'analytics' | 'settings') => void;
  totalLeads: number;
  noWebCount: number;
  firebaseStatus?: 'connected' | 'connecting' | 'error' | 'syncing';
  onSyncFirebase?: () => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenUpgradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  totalLeads,
  noWebCount,
  firebaseStatus = 'connected',
  onSyncFirebase,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenUpgradeModal,
}) => {
  const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Data Scrafing</span>
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                  SaaS B2B
                </span>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Crown className="w-3 h-3 text-amber-600" />
                    PRO MEMBER
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    FREE PLAN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Local Business Lead Intelligence & Outreach CRM
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold border border-slate-200/60">
            <button
              onClick={() => onTabChange('discovery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'discovery'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Pencarian Prospek</span>
            </button>

            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Database CRM</span>
              {totalLeads > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {totalLeads}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analitik & Omset</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'settings'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Upgrade Pro Button for Free Users */}
            {!isPremium && (
              <button
                onClick={onOpenUpgradeModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-orange-500/25 transition-all cursor-pointer animate-pulse"
                title="Buka akses semua nomor WhatsApp & download Excel"
              >
                <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                <span>Upgrade Pro (Rp 29rb)</span>
              </button>
            )}

            {/* Cloud Firestore Status */}
            <div 
              onClick={onSyncFirebase}
              title="Google Cloud Firestore Real-time - Klik untuk sinkronisasi"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Cloud className={`w-3.5 h-3.5 ${firebaseStatus === 'connected' ? 'text-amber-500' : firebaseStatus === 'syncing' ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-medium text-slate-500">Cloud DB:</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  firebaseStatus === 'connected' ? 'bg-emerald-500' :
                  firebaseStatus === 'syncing' ? 'bg-blue-500 animate-ping' :
                  firebaseStatus === 'connecting' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-slate-800 font-mono text-[10px]">
                  {firebaseStatus === 'syncing' ? 'Sync...' : 'Online'}
                </span>
              </span>
              {onSyncFirebase && (
                <RefreshCw className={`w-3 h-3 ml-0.5 text-slate-400 hover:text-slate-700 ${firebaseStatus === 'syncing' ? 'animate-spin' : ''}`} />
              )}
            </div>

            {/* Hot Leads Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Hot Leads:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {noWebCount} No Web
              </span>
            </div>

            {/* User Profile */}
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200" title={user.email || user.displayName || 'Member'}>
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {isPremium ? '👑 Premium Agensi' : 'Free Member'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
