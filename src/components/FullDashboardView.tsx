/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  MessageSquare, 
  ExternalLink, 
  CheckSquare, 
  Square,
  MapPin, 
  Phone, 
  Globe, 
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  PlusCircle,
  Lock,
  Crown
} from 'lucide-react';
import { BusinessLead, WebsiteStatus, ContactType, OutreachStatus, maskPhoneNumber } from '../types';

interface FullDashboardViewProps {
  leads: BusinessLead[];
  onDeleteLead: (id: string) => void;
  onBatchDeleteLeads: (ids: string[]) => void;
  onClearAllLeads: () => void;
  onExportExcel: (leadsToExport?: BusinessLead[]) => void;
  onExportCSV: (leadsToExport?: BusinessLead[]) => void;
  onSelectLead: (lead: BusinessLead) => void;
  onOpenWhatsAppOutreach: (lead: BusinessLead) => void;
  onUpdateLeadStatus: (leadId: string, status: OutreachStatus) => void;
  onOpenAddModal?: () => void;
  isPremium?: boolean;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const FullDashboardView: React.FC<FullDashboardViewProps> = ({
  leads,
  onDeleteLead,
  onBatchDeleteLeads,
  onClearAllLeads,
  onExportExcel,
  onExportCSV,
  onSelectLead,
  onOpenWhatsAppOutreach,
  onUpdateLeadStatus,
  onOpenAddModal,
  isPremium = false,
  onOpenUpgradeModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [contactFilter, setContactFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => set.add(l.category));
    return Array.from(set).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchTerm.toLowerCase().trim();
      const matchText =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.fullAddress.toLowerCase().includes(q) ||
        lead.category.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || lead.websiteStatus === statusFilter;
      const matchContact =
        contactFilter === 'ALL' ||
        (contactFilter === 'WHATSAPP' && lead.contactType === 'WHATSAPP') ||
        (contactFilter === 'LANDLINE' && lead.contactType === 'LANDLINE');
      const matchCategory = categoryFilter === 'ALL' || lead.category === categoryFilter;

      return matchText && matchStatus && matchContact && matchCategory;
    });
  }, [leads, searchTerm, statusFilter, contactFilter, categoryFilter]);

  // Selection toggle
  const isAllSelected = filteredLeads.length > 0 && selectedIds.size === filteredLeads.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.size} data lead yang dipilih?`)) {
      onBatchDeleteLeads(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleExportSelectedExcel = () => {
    if (!isPremium) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('Download Excel (.xlsx) resmi dan rapi khusus Member Premium. Buka akses tak terbatas seharga Rp 29.000/bln.');
      }
      return;
    }
    if (selectedIds.size === 0) {
      onExportExcel(filteredLeads);
    } else {
      const selected = leads.filter((l) => selectedIds.has(l.id));
      onExportExcel(selected);
    }
  };

  const handleExportSelectedCSV = () => {
    if (selectedIds.size === 0) {
      onExportCSV(filteredLeads);
    } else {
      const selected = leads.filter((l) => selectedIds.has(l.id));
      onExportCSV(selected);
    }
  };

  // Status counters
  const totalCount = leads.length;
  const noWebCount = leads.filter((l) => l.websiteStatus === 'NO WEBSITE').length;
  const socialCount = leads.filter((l) => l.websiteStatus === 'SOCIAL MEDIA ONLY').length;
  const hasWebCount = leads.filter((l) => l.websiteStatus === 'HAS WEBSITE').length;
  const waReadyCount = leads.filter((l) => l.contactType === 'WHATSAPP').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Database</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semua data hasil pencarian</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Tanpa Website</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{noWebCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Prioritas prospek #1</div>
        </div>

        <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 shadow-2xs">
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Social Media Only</div>
          <div className="text-2xl font-extrabold text-sky-700 mt-1">{socialCount}</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Peluang upgrade ke web</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sudah Punya Web</div>
          <div className="text-2xl font-extrabold text-slate-700 mt-1">{hasWebCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Peluang redesign</div>
        </div>

        <div className="bg-green-50/70 p-4 rounded-xl border border-green-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-green-800 uppercase tracking-wider">WhatsApp Ready</div>
          <div className="text-2xl font-extrabold text-green-700 mt-1">{waReadyCount}</div>
          <div className="text-[11px] text-green-600 font-medium mt-0.5">Nomor seluler terverifikasi</div>
        </div>
      </div>

      {/* Control & Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama bisnis, alamat, kategori, atau nomor kontak..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                title="Tambah data lead bisnis secara manual"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Tambah Lead Manual</span>
              </button>
            )}

            <button
              onClick={handleExportSelectedExcel}
              disabled={filteredLeads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
              title="Unduh data dalam format Excel .xlsx dengan SheetJS"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>
                {selectedIds.size > 0 ? `Export Excel (${selectedIds.size})` : 'Export Excel (.xlsx)'}
              </span>
            </button>

            <button
              onClick={handleExportSelectedCSV}
              disabled={filteredLeads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus ({selectedIds.size})</span>
              </button>
            )}

            {leads.length > 0 && (
              <button
                onClick={onClearAllLeads}
                className="text-xs text-slate-400 hover:text-rose-600 px-2 py-2 transition-colors ml-auto sm:ml-0"
                title="Hapus seluruh database"
              >
                Reset Semua
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Status Website</option>
            <option value="NO WEBSITE">⭐ Tanpa Website (NO WEBSITE)</option>
            <option value="SOCIAL MEDIA ONLY">Social Media Only</option>
            <option value="HAS WEBSITE">Sudah Punya Website</option>
            <option value="UNVERIFIED">Belum Terverifikasi</option>
          </select>

          {/* Contact Filter */}
          <select
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Nomor</option>
            <option value="WHATSAPP">WhatsApp Ready (+628...)</option>
            <option value="LANDLINE">Telepon Kantor (Landline)</option>
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-medium focus:outline-none focus:border-blue-500 max-w-[200px]"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div className="ml-auto text-slate-400 text-[11px]">
            Menampilkan <strong className="text-slate-700">{filteredLeads.length}</strong> dari {leads.length} leads
          </div>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="w-10 py-3 px-3 text-center">
                  <button
                    onClick={handleToggleAll}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Nama Perusahaan</th>
                <th className="py-3 px-3">Status Website</th>
                <th className="py-3 px-3">WhatsApp / Kontak</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Alamat Lengkap</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Outreach</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">Tidak ada leads yang sesuai filter.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci atau gunakan form di tab Extension Popup.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  const isNoWeb = lead.websiteStatus === 'NO WEBSITE';
                  const isHasWeb = lead.websiteStatus === 'HAS WEBSITE';
                  const isSocial = lead.websiteStatus === 'SOCIAL MEDIA ONLY';
                  const isWA = lead.contactType === 'WHATSAPP';

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => handleToggleRow(lead.id, e)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{lead.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          <span>{lead.location}</span>
                        </div>
                      </td>

                      {/* Website Status Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                            isNoWeb
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : isHasWeb
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isSocial
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {lead.websiteStatus}
                        </span>
                        {lead.websiteUrl && (
                          <a
                            href={lead.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 mt-0.5 max-w-[130px] truncate"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span>{lead.websiteUrl.replace(/https?:\/\/(www\.)?/, '')}</span>
                          </a>
                        )}
                      </td>

                      {/* Phone & Contact Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-medium flex items-center gap-1.5">
                          <span>{isPremium ? (lead.normalizedPhone || '-') : maskPhoneNumber(lead.normalizedPhone)}</span>
                          {!isPremium && (
                            <button
                              type="button"
                              onClick={() => onOpenUpgradeModal?.('Buka seluruh nomor telepon dan kirim pesan WhatsApp dengan Data Scrafing Premium seharga Rp 29.000!')}
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 font-bold inline-flex items-center gap-0.5"
                              title="Buka Nomor Lengkap (Rp 29rb)"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>Buka</span>
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5">
                          {isWA ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              WhatsApp Ready
                            </span>
                          ) : lead.contactType === 'LANDLINE' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              Telepon Kantor
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Tidak ada nomor</span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {lead.category}
                      </td>

                      {/* Address */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[220px] truncate" title={lead.fullAddress}>
                        {lead.fullAddress}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {lead.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-800">{lead.rating}</span>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] text-slate-400">
                              ({lead.userRatingsTotal || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Outreach Status */}
                      <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.outreachStatus || 'Belum Dihubungi'}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as OutreachStatus)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-md border focus:outline-none ${
                            lead.outreachStatus === 'Tertarik'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : lead.outreachStatus === 'Terkirim'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : lead.outreachStatus === 'Menolak'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : lead.outreachStatus === 'Follow Up'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="Belum Dihubungi">Belum Dihubungi</option>
                          <option value="Terkirim">Terkirim</option>
                          <option value="Tertarik">Tertarik</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Menolak">Menolak</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isWA && (
                            <button
                              onClick={() => {
                                if (!isPremium) {
                                  onOpenUpgradeModal?.('Upgrade ke Premium Rp 29.000 untuk langsung mengirim penawaran WhatsApp!');
                                  return;
                                }
                                onOpenWhatsAppOutreach(lead);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors ${
                                isPremium
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white'
                              }`}
                              title={isPremium ? "Kirim Penawaran Pembuatan Website via WhatsApp" : "Buka WhatsApp (Upgrade Rp 29rb)"}
                            >
                              {isPremium ? <MessageSquare className="w-3 h-3" /> : <Lock className="w-3 h-3 text-amber-200" />}
                              <span>Pitch WA</span>
                            </button>
                          )}

                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                            title="Buka di Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Hapus Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
