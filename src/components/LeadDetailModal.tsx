/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { BusinessLead, OutreachStatus } from '../types';

interface LeadDetailModalProps {
  lead: BusinessLead | null;
  onClose: () => void;
  onOpenWhatsAppOutreach: (lead: BusinessLead) => void;
  onUpdateStatus: (leadId: string, status: OutreachStatus) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onOpenWhatsAppOutreach,
  onUpdateStatus,
}) => {
  if (!lead) return null;

  const isNoWeb = lead.websiteStatus === 'NO WEBSITE';
  const isHasWeb = lead.websiteStatus === 'HAS WEBSITE';
  const isSocial = lead.websiteStatus === 'SOCIAL MEDIA ONLY';
  const isWA = lead.contactType === 'WHATSAPP';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Detail Peluang Bisnis
            </span>
            <h3 className="font-extrabold text-slate-900 text-base leading-snug">{lead.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Status Website</span>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${
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
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] block">Tipe Kontak</span>
              <span className="inline-block mt-1 text-xs font-bold text-slate-800">
                {isWA ? 'WhatsApp Ready (+628...)' : lead.contactType === 'LANDLINE' ? 'Telepon Kantor' : 'Tidak Ada'}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 divide-y divide-slate-100">
            <div className="pt-2 flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Nomor Kontak</span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {lead.normalizedPhone || '-'}
                </span>
                {lead.phone && lead.phone !== lead.normalizedPhone && (
                  <span className="text-[10px] text-slate-400 block">Asli: {lead.phone}</span>
                )}
              </div>
            </div>

            <div className="pt-3 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Alamat Fisik Lengkap</span>
                <span className="text-slate-800 leading-relaxed font-medium">{lead.fullAddress}</span>
              </div>
            </div>

            <div className="pt-3 flex items-start gap-3">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Kategori & Wilayah</span>
                <span className="text-slate-800 font-medium">
                  {lead.category} — {lead.location}
                </span>
              </div>
            </div>

            {lead.rating && (
              <div className="pt-3 flex items-start gap-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[11px] block">Rating & Review Google Maps</span>
                  <span className="text-slate-800 font-bold">
                    {lead.rating} ⭐ ({lead.userRatingsTotal || 0} ulasan pelanggan)
                  </span>
                </div>
              </div>
            )}

            {lead.websiteUrl && (
              <div className="pt-3 flex items-start gap-3">
                <Globe className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[11px] block">Link Website / Media Sosial</span>
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all font-medium"
                  >
                    {lead.websiteUrl}
                  </a>
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Tanggal Pengambilan:</span>
              </div>
              <span className="font-mono text-slate-700 font-medium">{lead.dateScraped}</span>
            </div>

            {/* Outreach Status Selector */}
            <div className="pt-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Status Penawaran:</span>
              <select
                value={lead.outreachStatus || 'Belum Dihubungi'}
                onChange={(e) => onUpdateStatus(lead.id, e.target.value as OutreachStatus)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-semibold bg-white text-slate-800"
              >
                <option value="Belum Dihubungi">Belum Dihubungi</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Tertarik">Tertarik</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Menolak">Menolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <a
            href={lead.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Google Maps</span>
          </a>

          <div className="flex items-center gap-2">
            {isWA && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhatsAppOutreach(lead);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Pitch WA</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
