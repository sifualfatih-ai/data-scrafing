/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  CheckCircle, 
  Users, 
  Globe, 
  PieChart, 
  BarChart3, 
  ArrowUpRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { BusinessLead, AppSettings } from '../types';

interface AnalyticsViewProps {
  leads: BusinessLead[];
  settings: AppSettings;
  onOpenDashboard: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads, settings, onOpenDashboard }) => {
  const packagePrice = settings.websiteOfferPrice || 3500000; // Default Rp 3.500.000 per website project

  const stats = useMemo(() => {
    const total = leads.length;
    const noWeb = leads.filter((l) => l.websiteStatus === 'NO WEBSITE').length;
    const socialOnly = leads.filter((l) => l.websiteStatus === 'SOCIAL MEDIA ONLY').length;
    const hasWeb = leads.filter((l) => l.websiteStatus === 'HAS WEBSITE').length;
    const unverified = leads.filter((l) => l.websiteStatus === 'UNVERIFIED').length;

    const contacted = leads.filter((l) => l.outreachStatus === 'Terkirim').length;
    const interested = leads.filter((l) => l.outreachStatus === 'Tertarik').length;
    const followUp = leads.filter((l) => l.outreachStatus === 'Follow Up').length;
    const won = leads.filter((l) => l.outreachStatus === 'Closing (Won)').length;
    const lost = leads.filter((l) => l.outreachStatus === 'Menolak').length;

    // Hot Leads = No Website + Social Media Only
    const hotLeads = noWeb + socialOnly;
    const totalPipelineValue = hotLeads * packagePrice;
    const wonRevenue = won * packagePrice;
    const projectedRevenue = Math.round(interested * packagePrice * 0.5 + wonRevenue);

    // Top Categories
    const catMap: Record<string, { total: number; noWeb: number }> = {};
    leads.forEach((l) => {
      if (!catMap[l.category]) catMap[l.category] = { total: 0, noWeb: 0 };
      catMap[l.category].total++;
      if (l.websiteStatus === 'NO WEBSITE' || l.websiteStatus === 'SOCIAL MEDIA ONLY') {
        catMap[l.category].noWeb++;
      }
    });

    const topCategories = Object.entries(catMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.noWeb - a.noWeb)
      .slice(0, 5);

    return {
      total,
      noWeb,
      socialOnly,
      hasWeb,
      unverified,
      contacted,
      interested,
      followUp,
      won,
      lost,
      hotLeads,
      totalPipelineValue,
      wonRevenue,
      projectedRevenue,
      topCategories,
    };
  }, [leads, packagePrice]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>B2B Pipeline & Revenue Forecasting</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Analitik Peluang & Potensi Omset Agensi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Berdasarkan model bisnis agensi web: estimasi nilai proyek <strong className="text-slate-800">{formatRupiah(packagePrice)}</strong> per website.
        </p>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Pipeline Value */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-100 text-xs font-semibold">
            <span>Total Potensi Pipeline Web</span>
            <DollarSign className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-3xl font-black tracking-tight">
            {formatRupiah(stats.totalPipelineValue)}
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Dihitung dari <strong>{stats.hotLeads} Hot Leads</strong> (Tanpa Website + Medsos Saja) dengan estimasi paket Rp 3.5jt.
          </p>
        </div>

        {/* Won Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold">
            <span>Omset Closing Terverifikasi (Won)</span>
            <CheckCircle className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl font-black tracking-tight">
            {formatRupiah(stats.wonRevenue)}
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Dari <strong>{stats.won} Klien Closing</strong> yang berhasil dikonversi dari pipeline outreach.
          </p>
        </div>

        {/* Projected Pipeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estimasi Omset Proyeksi (50% Win Rate)</span>
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {formatRupiah(stats.projectedRevenue)}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Memperhitungkan prospek berstatus <em>Tertarik ({stats.interested})</em> dan <em>Follow Up ({stats.followUp})</em>.
          </p>
        </div>
      </div>

      {/* Funnel & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Outreach Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Corong Konversi Penawaran (Sales Funnel)</span>
            </h3>
            <button
              onClick={onOpenDashboard}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Kelola di CRM →
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Total Leads Terkumpul', count: stats.total, color: 'bg-slate-200 text-slate-800', bar: 'bg-slate-400', pct: 100 },
              { label: 'Hot Leads (Tanpa Website)', count: stats.hotLeads, color: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', pct: stats.total ? Math.round((stats.hotLeads / stats.total) * 100) : 0 },
              { label: 'Pesan WhatsApp Terkirim', count: stats.contacted, color: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500', pct: stats.total ? Math.round((stats.contacted / stats.total) * 100) : 0 },
              { label: 'Prospek Tertarik / Diskusi', count: stats.interested, color: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500', pct: stats.total ? Math.round((stats.interested / stats.total) * 100) : 0 },
              { label: 'Closing Proyek Website (Won)', count: stats.won, color: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600', pct: stats.total ? Math.round((stats.won / stats.total) * 100) : 0 },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900">{step.count} data</span>
                    <span className="text-[10px] text-slate-400 font-mono">({step.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(4, step.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Industries by Missing Website */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Sektor Usaha Paling Membutuhkan Website</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {stats.topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada data industri yang tersimpan.
              </p>
            ) : (
              stats.topCategories.map((cat, idx) => {
                const ratio = cat.total > 0 ? Math.round((cat.noWeb / cat.total) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{cat.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {cat.noWeb} dari {cat.total} bisnis belum punya website
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                        {ratio}% No Web
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
