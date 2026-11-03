/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Sparkles, ExternalLink } from 'lucide-react';
import { BusinessLead, OutreachStatus } from '../types';
import { buildWhatsAppUrl, generateOutreachPitch } from '../utils/phoneHelper';

interface OutreachModalProps {
  lead: BusinessLead | null;
  agencyName: string;
  senderName: string;
  onClose: () => void;
  onStatusUpdate: (leadId: string, status: OutreachStatus) => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  lead,
  agencyName,
  senderName,
  onClose,
  onStatusUpdate,
}) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      const generated = generateOutreachPitch({
        businessName: lead.name,
        category: lead.category,
        location: lead.location,
        websiteStatus: lead.websiteStatus,
        rating: lead.rating,
        agencyName,
        senderName,
      });
      setMessage(generated);
    }
  }, [lead, agencyName, senderName]);

  if (!lead) return null;

  const cleanPhone = lead.normalizedPhone.replace(/[^0-9]/g, '');
  const waUrl = buildWhatsAppUrl(cleanPhone, message);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    onStatusUpdate(lead.id, 'Terkirim');
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Penawaran Website via WhatsApp</h3>
              <p className="text-xs text-slate-500">Kirim proposal instan ke pemilik bisnis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Business Summary */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                {lead.websiteStatus}
              </span>
            </div>
            <div className="text-slate-600 flex items-center gap-2 font-mono">
              <span>Nomor WhatsApp:</span>
              <strong className="text-blue-700">{lead.normalizedPhone}</strong>
            </div>
            <div className="text-slate-500 text-[11px] truncate">
              {lead.fullAddress}
            </div>
          </div>

          {/* Pitch Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Pesan Penawaran Jasa Pembuatan Website:</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 font-mono leading-relaxed bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400">
              *Pesan sudah diformat rapi dengan markdown bold (*) untuk WhatsApp. Anda dapat mengedit teks di atas sebelum mengirim.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp Web / App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
