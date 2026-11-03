/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Layers, 
  Globe, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileSpreadsheet, 
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Lock,
  Crown
} from 'lucide-react';
import { BusinessLead, ScrapeProgress, SearchParams, maskPhoneNumber } from '../types';
import { verifyWebsiteLive } from '../services/scraperService';

interface LeadDiscoveryViewProps {
  leads: BusinessLead[];
  onStartScraping: (params: SearchParams) => Promise<void>;
  scrapeProgress: ScrapeProgress;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenDashboard: () => void;
  onSelectLead: (lead: BusinessLead) => void;
  onOpenWhatsAppOutreach: (lead: BusinessLead) => void;
  isTeamoConfigured?: boolean;
  currentModel?: string;
  onOpenSettings?: () => void;
  onUpdateLead?: (updatedLead: BusinessLead) => void;
  isPremium?: boolean;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const LeadDiscoveryView: React.FC<LeadDiscoveryViewProps> = ({
  leads,
  onStartScraping,
  scrapeProgress,
  onExportExcel,
  onExportCSV,
  onOpenDashboard,
  onSelectLead,
  onOpenWhatsAppOutreach,
  isTeamoConfigured,
  currentModel = 'gemini-3.8-flash',
  onOpenSettings,
  onUpdateLead,
  isPremium = false,
  onOpenUpgradeModal,
}) => {
  const [businessType, setBusinessType] = useState('Bengkel Mobil');
  const [location, setLocation] = useState('Bandung');
  const [targetCount, setTargetCount] = useState<number>(isPremium ? 100 : 25);
  const [verifyLive, setVerifyLive] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isScanning = 
    scrapeProgress.status === 'searching' || 
    scrapeProgress.status === 'parsing' || 
    scrapeProgress.status === 'verifying';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType.trim() || !location.trim()) return;

    if (!isPremium && targetCount > 25) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('Pencarian 50-100 leads per batch adalah fitur khusus Member Premium Rp 29.000/bln.');
      }
      return;
    }

    onStartScraping({
      businessType: businessType.trim(),
      location: location.trim(),
      targetCount,
      verifyWebsitesLive: verifyLive,
    });
  };

  const handleVerifySingle = async (lead: BusinessLead) => {
    if (!isPremium) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('Fitur Live HTTP Domain Verifier adalah fitur eksklusif Member Premium Rp 29.000/bln.');
      }
      return;
    }
    if (!lead.websiteUrl) return;
    setVerifyingId(lead.id);
    try {
      const ver = await verifyWebsiteLive(lead.websiteUrl);
      const updated: BusinessLead = {
        ...lead,
        websiteVerification: ver,
        notes: ver.status === 'dead' 
          ? `Domain tidak aktif (HTTP ${ver.httpCode || 0}). Peluang pembuatan website baru!`
          : lead.notes,
      };
      if (onUpdateLead) onUpdateLead(updated);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleExportExcelClick = () => {
    if (!isPremium) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('Download Excel (.xlsx) resmi dan rapi khusus Member Premium. Dapatkan akses tak terbatas hanya Rp 29.000/bln.');
      }
      return;
    }
    onExportExcel();
  };

  const handlePitchClick = (lead: BusinessLead) => {
    if (!isPremium) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('Buka nomor WhatsApp terverifikasi dan kirim penawaran langsung dengan upgrade Premium Rp 29.000/bulan!');
      }
      return;
    }
    onOpenWhatsAppOutreach(lead);
  };

  const totalBisnis = leads.length;
  const noWebCount = leads.filter((l) => l.websiteStatus === 'NO WEBSITE').length;
  const socialOnlyCount = leads.filter((l) => l.websiteStatus === 'SOCIAL MEDIA ONLY').length;
  const hasWebCount = leads.filter((l) => l.websiteStatus === 'HAS WEBSITE').length;

  const presets = [
    { type: 'Bengkel Mobil & Motor', loc: 'Bandung' },
    { type: 'Klinik Gigi & Estetika', loc: 'Jakarta Selatan' },
    { type: 'Restoran & Kafe', loc: 'Surabaya' },
    { type: 'Kontraktor Interior & Arsitek', loc: 'Tangerang' },
    { type: 'Toko Bahan Bangunan & Distributor', loc: 'Semarang' },
    { type: 'Salon Kecantikan & Barbershop', loc: 'Bekasi' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SaaS Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>B2B Lead Intelligence Engine • Platform SaaS</span>
            </div>

            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Paket Premium Aktif</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onOpenUpgradeModal?.('Upgrade ke Premium Rp 29.000 untuk membuka semua kontak WhatsApp.')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Free Plan • Upgrade Rp 29rb/bln</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Temukan Bisnis Lokal yang <span className="text-emerald-400 underline decoration-emerald-500/50">Belum Punya Website</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Pindai ribuan UMKM di kota target Anda, klasifikasikan status kepemilikan website, verifikasi kontak WhatsApp, dan langsung kirimkan penawaran jasa pembuatan website.
          </p>

          {/* Engine indicator */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Engine: <strong className="text-white font-mono">{isTeamoConfigured ? currentModel : 'Heuristic Demo Database'}</strong></span>
            </div>
            {!isTeamoConfigured && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Mode Demo Aktif • Hubungkan TeamoRouter di Pengaturan untuk kuota tanpa batas
              </span>
            )}
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Discovery Search Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Parameter Pencarian & Akuisisi Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan ceruk industri bisnis (ICP) dan lokasi spesifik di Indonesia yang ingin Anda jelajahi.
          </p>
        </div>

        {/* Quick Preset Chips */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Preset Cepat Industri Indonesia:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBusinessType(p.type);
                  setLocation(p.loc);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  businessType === p.type && location === p.loc
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.type} • <span className="font-semibold">{p.loc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Jenis Usaha / Niche Target *</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Contoh: Bengkel Mobil, Klinik Gigi, Restoran Padang"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Lokasi / Wilayah di Indonesia *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Bandung, Cimahi, Surabaya, Jakarta"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Target Count */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Target Kuota Data Per Batch</label>
                {!isPremium && (
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Maks 25 (Free)</span>
                  </span>
                )}
              </div>
              <select
                value={targetCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isPremium && val > 25) {
                    onOpenUpgradeModal?.('Kapasitas 50 & 100 prospek per batch khusus Member Premium Rp 29.000/bln.');
                    return;
                  }
                  setTargetCount(val);
                }}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value={10}>10 Bisnis (Cepat ~3 detik)</option>
                <option value={25}>25 Bisnis (Standar ~6 detik)</option>
                <option value={50}>50 Bisnis {!isPremium ? '🔒 [PRO]' : '(Lengkap ~12 detik)'}</option>
                <option value={100}>100 Bisnis {!isPremium ? '🔒 [PRO]' : '(Full Pipeline ~24 detik)'}</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifyLive}
                onChange={(e) => {
                  if (!isPremium && e.target.checked) {
                    onOpenUpgradeModal?.('Live HTTP Domain Verifier adalah fitur eksklusif Member Premium Rp 29.000/bln.');
                    return;
                  }
                  setVerifyLive(e.target.checked);
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                <span>Aktifkan <strong>Live HTTP Domain Verifier</strong> (uji domain aktif vs 404/mati)</span>
                {!isPremium && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </span>
            </label>

            <button
              type="submit"
              disabled={isScanning}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Mengumpulkan Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>MULAI PENCARIAN PROSPEK</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Progress Box */}
        {isScanning && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/90 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>{scrapeProgress.currentStep || 'Memproses pencarian...'}</span>
              </span>
              <span className="font-mono text-blue-700 font-bold">{scrapeProgress.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                style={{ width: `${scrapeProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Database</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalBisnis}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Seluruh prospek tersimpan</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Tanpa Website (Hot Leads)</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{noWebCount}</div>
          <span className="text-[11px] text-emerald-700/80 mt-0.5 block">Prioritas utama penawaran web</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-sky-200 shadow-2xs bg-sky-50/20">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Medsos Saja</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{socialOnlyCount}</div>
          <span className="text-[11px] text-sky-700/80 mt-0.5 block">Siap ditawari landing page resmi</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sudah Punya Web</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-1">{hasWebCount}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Target audit SEO / redesign</span>
        </div>
      </div>

      {/* Discovery Results Preview Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hasil Penemuan Terkini</h3>
            <p className="text-xs text-slate-500">
              Menampilkan {Math.min(15, leads.length)} dari total {leads.length} prospek bisnis yang tersimpan di cloud CRM Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcelClick}
              disabled={leads.length === 0}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
                isPremium
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isPremium ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
              <span>Download Excel (.xlsx) {!isPremium ? '[PRO]' : ''}</span>
            </button>

            <button
              onClick={onExportCSV}
              disabled={leads.length === 0}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={onOpenDashboard}
              className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>Buka Database Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table with Phone Blurring */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Nama Bisnis & Kategori</th>
                <th className="py-2.5 px-3">Status Website</th>
                <th className="py-2.5 px-3">Kontak / WhatsApp</th>
                <th className="py-2.5 px-3">Alamat</th>
                <th className="py-2.5 px-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data prospek. Masukkan jenis usaha dan lokasi di atas lalu klik Mulai Pencarian.
                  </td>
                </tr>
              ) : (
                leads.slice(0, 15).map((lead) => {
                  const isNoWeb = lead.websiteStatus === 'NO WEBSITE';
                  const isSocial = lead.websiteStatus === 'SOCIAL MEDIA ONLY';
                  const displayPhone = isPremium ? (lead.normalizedPhone || '-') : maskPhoneNumber(lead.normalizedPhone);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.category} • {lead.location}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isNoWeb
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : isSocial
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {lead.websiteStatus}
                        </span>

                        {lead.websiteUrl && (
                          <div className="flex items-center gap-1 mt-1 text-[10px]">
                            <a
                              href={lead.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-0.5 max-w-[130px] truncate"
                            >
                              <Globe className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{lead.websiteUrl.replace(/^https?:\/\//, '')}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleVerifySingle(lead)}
                              disabled={verifyingId === lead.id}
                              title={isPremium ? "Audit HTTP Status Domain" : "Audit HTTP Domain (Khusus Premium)"}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                            >
                              <Activity className={`w-3 h-3 ${verifyingId === lead.id ? 'animate-spin text-blue-600' : ''}`} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Phone Column with Blurring for Free Users */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-medium flex items-center gap-1.5">
                          <span>{displayPhone}</span>
                          {!isPremium && (
                            <button
                              type="button"
                              onClick={() => onOpenUpgradeModal?.('Buka seluruh nomor telepon dan kirim pesan WhatsApp dengan NAFSFlow Premium Rp 29.000/bln!')}
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 font-bold inline-flex items-center gap-0.5"
                              title="Buka Nomor Lengkap (Rp 29rb)"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>Buka</span>
                            </button>
                          )}
                        </div>
                        {lead.contactType === 'WHATSAPP' && (
                          <span className="block text-[10px] font-sans font-semibold text-emerald-600">
                            WhatsApp Ready
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[200px] truncate" title={lead.fullAddress}>
                        {lead.fullAddress}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.contactType === 'WHATSAPP' && (
                            <button
                              onClick={() => handlePitchClick(lead)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs ${
                                isPremium
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white'
                              }`}
                              title={isPremium ? "Kirim Pesan WhatsApp" : "Buka WhatsApp (Upgrade Rp 29rb)"}
                            >
                              {isPremium ? <MessageSquare className="w-3 h-3" /> : <Lock className="w-3 h-3 text-amber-200" />}
                              <span>Pitch WA</span>
                            </button>
                          )}
                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Buka di Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
