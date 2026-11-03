/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessLead } from '../types';
import { normalizeIndonesianPhone } from '../utils/phoneHelper';

export interface RawPlaceItem {
  name: string;
  category: string;
  location: string;
  fullAddress: string;
  phone: string;
  websiteStatus: 'NO WEBSITE' | 'HAS WEBSITE' | 'SOCIAL MEDIA ONLY' | 'UNVERIFIED';
  websiteUrl?: string;
  rating: number;
  userRatingsTotal: number;
  mapsQuery: string;
}

export const INDONESIAN_PLACES_DATABASE: RawPlaceItem[] = [
  // Bandung - Bengkel Mobil & Motor
  {
    name: 'Bengkel Mobil Jaya Sentosa',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Buah Batu No. 142, Turangga, Kec. Lengkong, Kota Bandung, Jawa Barat 40264',
    phone: '081223498761',
    websiteStatus: 'NO WEBSITE',
    rating: 4.7,
    userRatingsTotal: 84,
    mapsQuery: 'Bengkel+Mobil+Jaya+Sentosa+Bandung',
  },
  {
    name: 'Auto Service Sukajadi',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Sukajadi No. 89, Pasteur, Kec. Sukajadi, Kota Bandung, Jawa Barat 40162',
    phone: '085798124450',
    websiteStatus: 'HAS WEBSITE',
    websiteUrl: 'https://autoservicesukajadi.com',
    rating: 4.8,
    userRatingsTotal: 192,
    mapsQuery: 'Auto+Service+Sukajadi+Bandung',
  },
  {
    name: 'Motor Prima Speed',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Dipati Ukur No. 54A, Lebakgede, Kec. Coblong, Kota Bandung, Jawa Barat 40132',
    phone: '087822901134',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/motorprimaspeed_bdg',
    rating: 4.5,
    userRatingsTotal: 46,
    mapsQuery: 'Motor+Prima+Speed+Bandung',
  },
  {
    name: 'Bengkel Bubut & Las Karya Utama',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Soekarno Hatta No. 450, Batununggal, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40266',
    phone: '0227568910',
    websiteStatus: 'NO WEBSITE',
    rating: 4.3,
    userRatingsTotal: 29,
    mapsQuery: 'Bengkel+Karya+Utama+Soekarno+Hatta+Bandung',
  },
  {
    name: 'Bintang Ban & Spooring',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Laswi No. 18, Kacapiring, Kec. Batununggal, Kota Bandung, Jawa Barat 40271',
    phone: '081394551209',
    websiteStatus: 'NO WEBSITE',
    rating: 4.6,
    userRatingsTotal: 115,
    mapsQuery: 'Bintang+Ban+Laswi+Bandung',
  },
  {
    name: 'Duta Transmisi Matik',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Terusan Pasirkoja No. 102, Babakan Tarogong, Kec. Bojongloa Kaler, Kota Bandung 40232',
    phone: '082119884567',
    websiteStatus: 'NO WEBSITE',
    rating: 4.4,
    userRatingsTotal: 38,
    mapsQuery: 'Duta+Transmisi+Pasirkoja+Bandung',
  },
  {
    name: 'Klinik Mobil Pajajaran',
    category: 'Bengkel Mobil',
    location: 'Bandung',
    fullAddress: 'Jl. Pajajaran No. 73, Pamoyanan, Kec. Cicendo, Kota Bandung, Jawa Barat 40173',
    phone: '0226014522',
    websiteStatus: 'UNVERIFIED',
    rating: 4.2,
    userRatingsTotal: 17,
    mapsQuery: 'Klinik+Mobil+Pajajaran+Bandung',
  },

  // Bandung - Klinik & Apotek
  {
    name: 'Klinik Pratama Sehat Keluarga',
    category: 'Klinik',
    location: 'Bandung',
    fullAddress: 'Jl. Cikutra No. 195, Sukapada, Kec. Cibeunying Kidul, Kota Bandung, Jawa Barat 40125',
    phone: '081910238844',
    websiteStatus: 'NO WEBSITE',
    rating: 4.6,
    userRatingsTotal: 77,
    mapsQuery: 'Klinik+Pratama+Sehat+Keluarga+Bandung',
  },
  {
    name: 'Klinik Gigi Dental Smile Bandung',
    category: 'Klinik',
    location: 'Bandung',
    fullAddress: 'Jl. R.E. Martadinata No. 120, Cihapit, Kec. Bandung Wetan, Kota Bandung 40114',
    phone: '08112233990',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/dentalsmile_bandung',
    rating: 4.9,
    userRatingsTotal: 210,
    mapsQuery: 'Klinik+Gigi+Dental+Smile+Riau+Bandung',
  },
  {
    name: 'Klinik Herbal Al-Barokah',
    category: 'Klinik',
    location: 'Bandung',
    fullAddress: 'Jl. Kopo Cirangrang No. 34, Margasuka, Kec. Babakan Ciparay, Kota Bandung 40225',
    phone: '085220334190',
    websiteStatus: 'NO WEBSITE',
    rating: 4.5,
    userRatingsTotal: 32,
    mapsQuery: 'Klinik+Herbal+Al+Barokah+Kopo+Bandung',
  },
  {
    name: 'Klinik Utama BioMedika Bandung',
    category: 'Klinik',
    location: 'Bandung',
    fullAddress: 'Jl. Naripan No. 42, Kebon Pisang, Kec. Sumur Bandung, Kota Bandung 40112',
    phone: '0224208819',
    websiteStatus: 'HAS WEBSITE',
    websiteUrl: 'https://biomedikabandung.id',
    rating: 4.7,
    userRatingsTotal: 140,
    mapsQuery: 'Klinik+BioMedika+Naripan+Bandung',
  },

  // Bandung - Restoran & Kafe
  {
    name: 'Rumah Makan Dapur Sunda Asli',
    category: 'Restoran',
    location: 'Bandung',
    fullAddress: 'Jl. Cisangkuy No. 36, Cihapit, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40114',
    phone: '081298457788',
    websiteStatus: 'NO WEBSITE',
    rating: 4.8,
    userRatingsTotal: 340,
    mapsQuery: 'Dapur+Sunda+Asli+Cisangkuy+Bandung',
  },
  {
    name: 'Kopi Seduh Gunung Puntang',
    category: 'Restoran',
    location: 'Bandung',
    fullAddress: 'Jl. Progo No. 14, Citarum, Kec. Bandung Wetan, Kota Bandung 40115',
    phone: '087788992211',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/kopigunungpuntang_bdg',
    rating: 4.6,
    userRatingsTotal: 180,
    mapsQuery: 'Kopi+Seduh+Gunung+Puntang+Progo+Bandung',
  },
  {
    name: 'Warung Nasi Sambal Dadak Mang Ujang',
    category: 'Restoran',
    location: 'Bandung',
    fullAddress: 'Jl. PH.H. Mustofa No. 88, Padasuka, Kec. Cibeunying Kidul, Kota Bandung 40124',
    phone: '089655443322',
    websiteStatus: 'NO WEBSITE',
    rating: 4.4,
    userRatingsTotal: 95,
    mapsQuery: 'Warung+Nasi+Mang+Ujang+Suci+Bandung',
  },

  // Bandung - Toko & Distributor & UMKM
  {
    name: 'Toko Bangunan Sumber Makmur',
    category: 'Toko dan distributor',
    location: 'Bandung',
    fullAddress: 'Jl. A. Yani No. 638, Cicaheum, Kec. Kiaracondong, Kota Bandung, Jawa Barat 40282',
    phone: '0227103445',
    websiteStatus: 'NO WEBSITE',
    rating: 4.3,
    userRatingsTotal: 51,
    mapsQuery: 'Toko+Bangunan+Sumber+Makmur+Cicaheum+Bandung',
  },
  {
    name: 'Distributor Grosir Snack Nusantara',
    category: 'Toko dan distributor',
    location: 'Bandung',
    fullAddress: 'Jl. Pagarsih No. 188, Jamika, Kec. Bojongloa Kaler, Kota Bandung 40231',
    phone: '081322001928',
    websiteStatus: 'NO WEBSITE',
    rating: 4.7,
    userRatingsTotal: 68,
    mapsQuery: 'Grosir+Snack+Nusantara+Pagarsih+Bandung',
  },
  {
    name: 'Sentra Sablon & Kaos Polos Bandung',
    category: 'UMKM',
    location: 'Bandung',
    fullAddress: 'Jl. Surapati No. 129, Sukaluyu, Kec. Cibeunying Kaler, Kota Bandung 40123',
    phone: '081288776655',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/sablonkaosbandung_official',
    rating: 4.6,
    userRatingsTotal: 124,
    mapsQuery: 'Sentra+Sablon+Surapati+Bandung',
  },
  {
    name: 'Mitra Konstruksi & Kanopi Minimalis',
    category: 'Jasa konstruksi',
    location: 'Bandung',
    fullAddress: 'Jl. Terusan Cibaduyut No. 45, Cangkuang Kulon, Kec. Dayeuhkolot, Bandung 40239',
    phone: '085311229988',
    websiteStatus: 'NO WEBSITE',
    rating: 4.5,
    userRatingsTotal: 40,
    mapsQuery: 'Mitra+Konstruksi+Cibaduyut+Bandung',
  },

  // Cimahi
  {
    name: 'Bengkel Bubut Presisi Cimahi',
    category: 'Bengkel Mobil',
    location: 'Cimahi',
    fullAddress: 'Jl. Amir Machmud No. 340, Cigugur Tengah, Kec. Cimahi Tengah, Kota Cimahi 40522',
    phone: '081299881122',
    websiteStatus: 'NO WEBSITE',
    rating: 4.5,
    userRatingsTotal: 58,
    mapsQuery: 'Bengkel+Presisi+Amir+Machmud+Cimahi',
  },
  {
    name: 'Klinik Medika Cimahi Utama',
    category: 'Klinik',
    location: 'Cimahi',
    fullAddress: 'Jl. Gandawijaya No. 82, Setiamanah, Kec. Cimahi Tengah, Kota Cimahi 40524',
    phone: '0226654321',
    websiteStatus: 'NO WEBSITE',
    rating: 4.3,
    userRatingsTotal: 41,
    mapsQuery: 'Klinik+Medika+Gandawijaya+Cimahi',
  },
  {
    name: 'Distributor Pakan Ternak Cimahi Makmur',
    category: 'Toko dan distributor',
    location: 'Cimahi',
    fullAddress: 'Jl. Kolonel Masturi No. 115, Cipageran, Kec. Cimahi Utara, Kota Cimahi 40511',
    phone: '087823456789',
    websiteStatus: 'NO WEBSITE',
    rating: 4.7,
    userRatingsTotal: 34,
    mapsQuery: 'Pakan+Ternak+Kolonel+Masturi+Cimahi',
  },

  // Jakarta
  {
    name: 'Bengkel Kaki-Kaki Mas Agus',
    category: 'Bengkel Mobil',
    location: 'Jakarta',
    fullAddress: 'Jl. Fatmawati Raya No. 45, Cipete Selatan, Kec. Cilandak, Jakarta Selatan 12410',
    phone: '081389771120',
    websiteStatus: 'NO WEBSITE',
    rating: 4.8,
    userRatingsTotal: 153,
    mapsQuery: 'Bengkel+Mas+Agus+Fatmawati+Jakarta',
  },
  {
    name: 'Klinik Estetika Glow Medika',
    category: 'Klinik',
    location: 'Jakarta',
    fullAddress: 'Jl. Tebet Timur Dalam Raya No. 29, Tebet, Jakarta Selatan 12820',
    phone: '08119988771',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/glowmedika_tebet',
    rating: 4.9,
    userRatingsTotal: 290,
    mapsQuery: 'Klinik+Glow+Medika+Tebet+Jakarta',
  },
  {
    name: 'CV Baja Sinar Mandiri',
    category: 'Jasa konstruksi',
    location: 'Jakarta',
    fullAddress: 'Jl. Daan Mogot Km. 13 No. 55, Cengkareng Timur, Jakarta Barat 11730',
    phone: '0215448901',
    websiteStatus: 'NO WEBSITE',
    rating: 4.2,
    userRatingsTotal: 28,
    mapsQuery: 'Baja+Sinar+Mandiri+Daan+Mogot+Jakarta',
  },
  {
    name: 'Resto Seafood Muara Kapuk',
    category: 'Restoran',
    location: 'Jakarta',
    fullAddress: 'Jl. Pluit Karang Cantik No. 12, Muara Karang, Penjaringan, Jakarta Utara 14450',
    phone: '081289004433',
    websiteStatus: 'NO WEBSITE',
    rating: 4.6,
    userRatingsTotal: 410,
    mapsQuery: 'Seafood+Muara+Kapuk+Pluit+Jakarta',
  },
  {
    name: 'Lembaga Kursus Stir Mobil Mandiri',
    category: 'Lembaga pendidikan',
    location: 'Jakarta',
    fullAddress: 'Jl. Pramuka No. 170, Utan Kayu Utara, Matraman, Jakarta Timur 13120',
    phone: '085711223344',
    websiteStatus: 'UNVERIFIED',
    rating: 4.4,
    userRatingsTotal: 65,
    mapsQuery: 'Kursus+Stir+Mandiri+Pramuka+Jakarta',
  },

  // Surabaya
  {
    name: 'Bengkel AC Mobil Dingin Prima',
    category: 'Bengkel Mobil',
    location: 'Surabaya',
    fullAddress: 'Jl. Ngagel Jaya Selatan No. 88, Pucang Sewu, Kec. Gubeng, Kota Surabaya 60283',
    phone: '081333445566',
    websiteStatus: 'NO WEBSITE',
    rating: 4.7,
    userRatingsTotal: 112,
    mapsQuery: 'AC+Mobil+Dingin+Prima+Ngagel+Surabaya',
  },
  {
    name: 'Pusat Grosir Plastik & Kemasan Rungkut',
    category: 'Toko dan distributor',
    location: 'Surabaya',
    fullAddress: 'Jl. Rungkut Industri III No. 24, Kutisari, Kec. Tenggilis Mejoyo, Kota Surabaya 60291',
    phone: '0318439900',
    websiteStatus: 'NO WEBSITE',
    rating: 4.4,
    userRatingsTotal: 48,
    mapsQuery: 'Grosir+Plastik+Rungkut+Surabaya',
  },
  {
    name: 'Depot Rawon & Bebek Bu Krisna',
    category: 'Restoran',
    location: 'Surabaya',
    fullAddress: 'Jl. Kertajaya No. 142, Kertajaya, Kec. Gubeng, Kota Surabaya 60282',
    phone: '081230495811',
    websiteStatus: 'SOCIAL MEDIA ONLY',
    websiteUrl: 'https://instagram.com/rawonbukrisna_sub',
    rating: 4.8,
    userRatingsTotal: 520,
    mapsQuery: 'Rawon+Bu+Krisna+Kertajaya+Surabaya',
  },
  {
    name: 'Klinik Pratama Rawat Inap Bhakti Medika',
    category: 'Klinik',
    location: 'Surabaya',
    fullAddress: 'Jl. Mayjen Sungkono No. 177, Gunung Sari, Kec. Dukuhpakis, Surabaya 60224',
    phone: '0315671122',
    websiteStatus: 'HAS WEBSITE',
    websiteUrl: 'https://bhaktimedika-surabaya.co.id',
    rating: 4.6,
    userRatingsTotal: 98,
    mapsQuery: 'Bhakti+Medika+Mayjen+Sungkono+Surabaya',
  },
];

/**
 * Generates dynamic leads matching search query criteria
 */
export function generateMockLeads(
  businessType: string,
  location: string,
  targetCount: number
): BusinessLead[] {
  const currentDate = new Date().toISOString().split('T')[0];
  const queryType = (businessType || 'Bengkel Mobil').toLowerCase();
  const queryLoc = (location || 'Bandung').toLowerCase();

  // Filter seed that matches or is close
  let matches = INDONESIAN_PLACES_DATABASE.filter(item => {
    const catMatch = item.category.toLowerCase().includes(queryType) || queryType.includes(item.category.toLowerCase());
    const locMatch = item.location.toLowerCase().includes(queryLoc) || queryLoc.includes(item.location.toLowerCase());
    return catMatch || locMatch;
  });

  // If matches are few, take all and adapt
  if (matches.length < targetCount) {
    matches = [...matches, ...INDONESIAN_PLACES_DATABASE];
  }

  const results: BusinessLead[] = [];
  const seenPlaceIds = new Set<string>();

  let counter = 1;
  for (let i = 0; i < matches.length && results.length < targetCount; i++) {
    const raw = matches[i % matches.length];
    
    // Construct variations to satisfy count
    const iteration = Math.floor(i / INDONESIAN_PLACES_DATABASE.length);
    const suffix = iteration > 0 ? ` Cabang ${iteration + 1}` : '';
    const cleanName = `${raw.name}${suffix}`;
    const placeId = `ChIJ_${(cleanName + location).replace(/\s+/g, '_')}_${counter}`;

    if (seenPlaceIds.has(placeId)) {
      continue;
    }
    seenPlaceIds.add(placeId);

    // Dynamic phone mutation if duplicated
    let phoneToUse = raw.phone;
    if (iteration > 0 && phoneToUse.startsWith('08')) {
      phoneToUse = '08' + (parseInt(phoneToUse.slice(2), 10) + counter * 37).toString().padStart(10, '0').slice(0, 10);
    }

    const { normalized, contactType, isWhatsAppCandidate } = normalizeIndonesianPhone(phoneToUse);

    // Realistic address adapting to queried location
    let fullAddr = raw.fullAddress;
    if (!fullAddr.toLowerCase().includes(queryLoc)) {
      fullAddr = fullAddr.replace(/Kota Bandung|Bandung|Jakarta|Surabaya|Cimahi/gi, location.trim() || 'Bandung');
    }

    const lead: BusinessLead = {
      id: `lead_${Date.now()}_${counter}`,
      name: cleanName,
      category: businessType || raw.category,
      location: location || raw.location,
      fullAddress: fullAddr,
      phone: phoneToUse,
      normalizedPhone: normalized,
      contactType,
      isWhatsAppCandidate,
      websiteStatus: raw.websiteStatus,
      websiteUrl: raw.websiteUrl,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + ' ' + (location || raw.location))}`,
      placeId,
      rating: raw.rating,
      userRatingsTotal: raw.userRatingsTotal + (iteration * 12),
      dateScraped: currentDate,
      isDemo: true,
      notes: raw.websiteStatus === 'NO WEBSITE' ? 'Peluang tinggi - bisnis aktif tanpa website resmi' : undefined,
      outreachStatus: 'Belum Dihubungi',
    };

    results.push(lead);
    counter++;
  }

  return results;
}
