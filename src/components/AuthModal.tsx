/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, LogIn, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Nama lengkap wajib diisi.');
        }
        await registerWithEmail(email.trim(), password, name.trim());
        onSuccess(`Selamat datang, ${name}! Akun agensi Anda berhasil dibuat.`);
      } else {
        await loginWithEmail(email.trim(), password);
        onSuccess('Berhasil masuk ke akun agensi Anda!');
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Gagal memproses autentikasi.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Email atau password tidak sesuai.');
      } else if (msg.includes('email-already-in-use')) {
        setError('Email ini sudah terdaftar. Silakan pilih Masuk.');
      } else if (msg.includes('weak-password')) {
        setError('Password terlalu lemah. Minimal 6 karakter.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Data Scrafing Cloud Account
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Daftar Akun Agensi Baru' : 'Masuk ke Platform SaaS'}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Simpan data prospek bisnis dan preferensi model AI Anda secara terenkripsi dan terpusat di cloud.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap / Agensi</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rio Pratama - Web Studio"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@agensi.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Buat Akun Agensi Sekarang</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </>
            )}
          </button>

          {/* Toggle Register / Login */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isRegister
                ? 'Sudah punya akun agensi? Masuk di sini'
                : 'Belum punya akun? Buat akun agensi baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
