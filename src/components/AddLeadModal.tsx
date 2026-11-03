/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, PlusCircle, Building2, MapPin, Phone, Globe } from 'lucide-react';
import { BusinessLead, WebsiteStatus } from '../types';
import { normalizeIndonesianPhone } from '../utils/phoneHelper';

interface AddLeadModalProps {
  onClose: () => void;
  onAddLead: (lead: BusinessLead) => void;
  defaultLocation: string;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  onClose,
  onAddLead,
  defaultLocation,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bengkel Mobil');
  const [location, setLocation] = useState(defaultLocation || 'Bandung');
  const [fullAddress, setFullAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>('NO WEBSITE');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullAddress.trim()) {
      alert('Nama perusahaan dan alamat fisik lengkap wajib diisi!');
      return;
    }

    const { normalized, contactType, isWhatsAppCandidate } = normalizeIndonesianPhone(phone);
    const placeId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newLead: BusinessLead = {
      id: `lead_${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      location: location.trim(),
      fullAddress: fullAddress.trim(),
      phone: phone.trim(),
      normalizedPhone: normalized,
      contactType,
      isWhatsAppCandidate,
      websiteStatus,
      websiteUrl: websiteUrl.trim() || undefined,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name.trim() + ' ' + location.trim()
      )}`,
      placeId,
      dateScraped: new Date().toISOString().split('T')[0],
      isDemo: false,
      outreachStatus: 'Belum Dihubungi',
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tambah Data Bisnis Nyata</h3>
              <p className="text-xs text-slate-500">Masukkan informasi UMKM / perusahaan lokal secara manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Perusahaan / Bisnis *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bengkel Sentosa Jaya"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jenis Usaha / Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Bengkel, Restoran, Klinik"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kota / Lokasi</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bandung, Jakarta"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Alamat Fisik Lengkap *</label>
            <textarea
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Jl. Buah Batu No. 120, Kota Bandung"
              required
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Kontak / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Otomatis dinormalisasi ke +62</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status Website</label>
              <select
                value={websiteStatus}
                onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-semibold text-slate-800"
              >
                <option value="NO WEBSITE">NO WEBSITE</option>
                <option value="SOCIAL MEDIA ONLY">SOCIAL MEDIA ONLY</option>
                <option value="HAS WEBSITE">HAS WEBSITE</option>
                <option value="UNVERIFIED">UNVERIFIED</option>
              </select>
            </div>
          </div>

          {websiteStatus !== 'NO WEBSITE' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">URL Website / Media Sosial</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
            >
              Simpan Data Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
