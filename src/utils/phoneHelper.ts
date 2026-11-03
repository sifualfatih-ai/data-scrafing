/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContactType } from '../types';

/**
 * Normalizes Indonesian phone number to international format (+62)
 * Distinguishes between Mobile (WhatsApp candidate) and Landline (Telepon Kantor).
 */
export function normalizeIndonesianPhone(rawPhone?: string): {
  normalized: string;
  cleanDigits: string;
  contactType: ContactType;
  isWhatsAppCandidate: boolean;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      normalized: '-',
      cleanDigits: '',
      contactType: 'NONE',
      isWhatsAppCandidate: false,
    };
  }

  // Remove non-digit chars except '+'
  let clean = rawPhone.replace(/[^\d+]/g, '');

  // Handle leading '+'
  if (clean.startsWith('+62')) {
    clean = clean.substring(3);
  } else if (clean.startsWith('62')) {
    clean = clean.substring(2);
  } else if (clean.startsWith('0')) {
    clean = clean.substring(1);
  }

  // If empty after stripping
  if (!clean) {
    return {
      normalized: '-',
      cleanDigits: '',
      contactType: 'NONE',
      isWhatsAppCandidate: false,
    };
  }

  // Check if Mobile number (In Indonesia, mobile starts with 8...)
  // e.g. 811, 812, 813, 821, 852, 853, 857, 858, 877, 878, 895, 896, 881, etc.
  const isMobile = clean.startsWith('8');

  // Landline area codes: 21 (Jakarta), 22 (Bandung), 31 (Surabaya), 274 (Jogja), 24 (Semarang), etc.
  const isLandline = !isMobile && (clean.startsWith('2') || clean.startsWith('3') || clean.startsWith('4') || clean.startsWith('5') || clean.startsWith('6') || clean.startsWith('7') || clean.startsWith('9'));

  const fullInternational = `+62 ${formatPhoneGrouping(clean, isMobile)}`;
  const cleanE164 = `62${clean}`;

  return {
    normalized: fullInternational,
    cleanDigits: cleanE164,
    contactType: isMobile ? 'WHATSAPP' : isLandline ? 'LANDLINE' : 'NONE',
    isWhatsAppCandidate: isMobile,
  };
}

function formatPhoneGrouping(digits: string, isMobile: boolean): string {
  if (isMobile) {
    // Format 812-3456-7890
    if (digits.length >= 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    return digits;
  }
  // Landline format e.g. 22-1234567
  if (digits.length >= 8) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Builds direct WhatsApp Click to Chat URL with pre-filled message
 */
export function buildWhatsAppUrl(cleanDigits: string, message: string): string {
  if (!cleanDigits) return '#';
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}

/**
 * Generates an effective, polite, professional Indonesian sales pitch for web development services
 */
export function generateOutreachPitch(params: {
  businessName: string;
  category: string;
  location: string;
  websiteStatus: string;
  rating?: number;
  agencyName?: string;
  senderName?: string;
}): string {
  const { businessName, category, location, rating, agencyName = 'Data Scrafing Studio', senderName = 'Tim Konsultan' } = params;

  const ratingCompliment = rating && rating >= 4.0 
    ? `Kami perhatikan profil Google Maps ${businessName} mendapatkan rating luar biasa (${rating}⭐) dari pelanggan di ${location}.` 
    : `Kami menemukan profil usaha ${businessName} yang aktif melayani pelanggan di ${location}.`;

  return `Halo Admin/Owner *${businessName}*,\n\n` +
    `Salam kenal, saya ${senderName} dari *${agencyName}*.\n\n` +
    `${ratingCompliment}\n\n` +
    `Saat mencari informasi produk/layanan Anda, kami melihat bisnis Anda saat ini *belum memiliki website resmi/katalog online* untuk menampilkan pricelist, portofolio, dan reservasi otomatis.\n\n` +
    `Banyak kompetitor di bidang ${category} sudah beralih menggunakan website modern agar calon customer di Google bisa langsung order tanpa ragu dan meningkatkan kredibilitas bisnis.\n\n` +
    `Apakah Anda berkenan jika kami kirimkan *Free Demo Desain Website* khusus untuk ${businessName} tanpa biaya? Anda bisa melihat tampilannya terlebih dahulu.\n\n` +
    `Terima kasih dan sukses selalu untuk usahanya! 🙏`;
}
