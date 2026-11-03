/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  PhoneCall, 
  Globe 
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  triggerReason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  triggerReason,
}) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes timer
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15 * 60);
      setIsProcessing(false);
      setIsSuccess(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onUpgradeSuccess();
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-amber-200/80 overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Data Scrafing Premium Pass</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Buka Seluruh Potensi Klien Agensi Anda
            </h3>
            <p className="text-xs text-blue-200">
              {triggerReason || 'Buka seluruh nomor WhatsApp, live HTTP domain verifier, dan ekspor Excel tanpa batas.'}
            </p>
          </div>

          {/* Price Tag Pill */}
          <div className="absolute right-6 bottom-4 sm:bottom-6 text-right z-10">
            <span className="text-[10px] text-slate-300 uppercase block font-semibold">Biaya Langganan</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              Rp 29.000<span className="text-xs text-white font-normal">/bln</span>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Pembayaran Berhasil Dikonfirmasi!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Selamat! Akun Anda kini berstatus <strong>Data Scrafing Premium Active (30 Hari)</strong>. Seluruh nomor telepon telah terbuka dan kuota 1.500 leads aktif.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Comparison Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keuntungan Eksklusif Member Premium:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { title: 'Buka Semua Kontak WhatsApp', desc: '100% nomor terlihat tanpa sensor (••••)' },
                    { title: '1.500 Leads AI Live / Bulan', desc: 'Koneksi multi-model Gemini 3.8 & GPT' },
                    { title: 'Download Excel (.xlsx) Resmi', desc: 'Format tabel rapi & formula sanitized' },
                    { title: 'Live HTTP Domain Auditor', desc: 'Deteksi domain mati / 404 secara nyata' },
                    { title: '5+ Template WhatsApp Agensi', desc: 'Script teruji konversi tinggi ke owner' },
                    { title: 'Dasbor Analitik Potensi Omset', desc: 'Pantau nilai pipeline ratusan juta' },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{feat.title}</div>
                        <div className="text-[11px] text-slate-500">{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QRIS Payment Section */}
              <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/30 rounded-2xl border border-amber-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs tracking-tighter">
                      QRIS
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Pembayaran Instan Otomatis
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kadaluwarsa: {formatTimer(timeLeft)}</span>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  {/* Dynamic Realistic QRIS Vector */}
                  <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-between shrink-0">
                    <div className="text-[8px] font-bold text-red-600 tracking-wider uppercase">QRIS STANDAR NASIONAL</div>
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                      {/* Standard QR pattern mockup */}
                      <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                      <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                      <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                      {/* Random data grid simulation */}
                      <rect x="35" y="10" width="8" height="8" fill="#0f172a" />
                      <rect x="50" y="5" width="8" height="8" fill="#0f172a" />
                      <rect x="35" y="25" width="12" height="6" fill="#0f172a" />
                      <rect x="55" y="25" width="6" height="12" fill="#0f172a" />
                      <rect x="35" y="45" width="30" height="10" fill="#0f172a" />
                      <rect x="10" y="45" width="15" height="10" fill="#0f172a" />
                      <rect x="75" y="45" width="15" height="15" fill="#0f172a" />
                      <rect x="40" y="65" width="20" height="8" fill="#0f172a" />
                      <rect x="65" y="75" width="25" height="8" fill="#0f172a" />
                      <rect x="40" y="85" width="8" height="8" fill="#0f172a" />
                      <rect x="55" y="80" width="6" height="15" fill="#0f172a" />
                    </svg>
                    <div className="text-[7px] text-slate-400 font-mono tracking-tight">NMID: ID1024392817281</div>
                  </div>

                  {/* Payment Instructions & Amount */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Total Tagihan Pas
                      </span>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        Rp 29.000
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        Bebas biaya admin (0%)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Dapat dibayar dari: <strong>BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana, LinkAja</strong>.
                    </p>
                  </div>
                </div>

                {/* Instant Simulation Action */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memverifikasi Notifikasi QRIS...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-white fill-white" />
                        <span>SAYA SUDAH BAYAR (AKTIFKAN SEKARANG)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Mode Pengujian: Klik tombol di atas untuk simulasi verifikasi instan QRIS dan aktivasi akun Premium.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
