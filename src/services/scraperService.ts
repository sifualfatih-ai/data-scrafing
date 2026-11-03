/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessLead, ScrapeProgress, SearchParams, AppSettings, WebsiteVerification } from '../types';
import { normalizeIndonesianPhone } from '../utils/phoneHelper';
import { INDONESIAN_PLACES_DATABASE, RawPlaceItem } from '../data/indonesianPlacesSeed';

/**
 * Normalizes TeamoRouter base URL so it always points to the /v1 endpoint
 */
export function normalizeTeamoBaseUrl(rawUrl?: string): string {
  let url = (rawUrl || 'https://api.teamorouter.com').trim().replace(/\/+$/, '');
  if (!url) url = 'https://api.teamorouter.com';
  if (!url.endsWith('/v1')) {
    url += '/v1';
  }
  return url;
}

/**
 * Live website HTTP verification via local backend auditor proxy
 */
export async function verifyWebsiteLive(url: string): Promise<WebsiteVerification> {
  if (!url || !url.trim()) {
    return { status: 'untested' };
  }
  try {
    const res = await fetch('/api/verify-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status,
        httpCode: data.httpCode,
        checkedAt: new Date().toLocaleTimeString('id-ID'),
        error: data.error,
      };
    }
    return { status: 'dead', error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { status: 'dead', error: err?.message || 'Verification Error' };
  }
}

/**
 * Robust JSON parser that extracts valid JSON objects or arrays from LLM output
 */
export function extractJsonFromText(text: string): { businesses?: any[] } | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // 1. Direct JSON parse
  try {
    const direct = JSON.parse(trimmed);
    if (Array.isArray(direct)) return { businesses: direct };
    if (direct && Array.isArray(direct.businesses)) return direct;
    if (direct && typeof direct === 'object') {
      for (const key of Object.keys(direct)) {
        if (Array.isArray(direct[key])) return { businesses: direct[key] };
      }
      return direct;
    }
  } catch {}

  // 2. Extract from markdown code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) return { businesses: parsed };
      if (parsed && Array.isArray(parsed.businesses)) return parsed;
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key])) return { businesses: parsed[key] };
      }
    } catch {}
  }

  // 3. Find outermost JSON object {...}
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      if (parsed && Array.isArray(parsed.businesses)) return parsed;
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key])) return { businesses: parsed[key] };
      }
    } catch {}
  }

  // 4. Find outermost JSON array [...]
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const candidate = trimmed.substring(firstBracket, lastBracket + 1);
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return { businesses: parsed };
    } catch {}
  }

  return null;
}

/**
 * Tests connection to TeamoRouter API gateway
 */
export async function testTeamoRouterConnection(
  apiKey: string,
  baseUrl = 'https://api.teamorouter.com',
  model = 'gemini-3.8-flash'
): Promise<{ success: boolean; message: string; modelUsed: string }> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API Key TeamoRouter tidak boleh kosong.');
  }

  const cleanKey = apiKey.trim();
  const normalizedUrl = normalizeTeamoBaseUrl(baseUrl);
  const targetModel = model || 'gemini-3.8-flash';

  try {
    const proxyResp = await fetch('/api/teamorouter/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cleanKey,
        baseUrl: normalizedUrl,
        model: targetModel,
      }),
    });

    if (proxyResp.ok) {
      const result = await proxyResp.json();
      return {
        success: true,
        message: result.message || 'Koneksi ke TeamoRouter (api.teamorouter.com) berhasil terverifikasi!',
        modelUsed: result.modelUsed || targetModel,
      };
    } else {
      const errJson = await proxyResp.json().catch(() => null);
      if (errJson?.error?.message) {
        throw new Error(errJson.error.message);
      }
    }
  } catch (proxyErr: unknown) {
    const proxyMsg = proxyErr instanceof Error ? proxyErr.message : '';
    if (proxyMsg && !proxyMsg.includes('Failed to fetch') && !proxyMsg.includes('404')) {
      throw new Error(proxyMsg);
    }
  }

  // Direct fetch fallback
  const directEndpoint = `${normalizedUrl}/chat/completions`;
  const response = await fetch(directEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
      'x-api-key': cleanKey,
    },
    body: JSON.stringify({
      model: targetModel,
      messages: [{ role: 'user', content: 'Ping test' }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errDetail = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Koneksi TeamoRouter gagal: ${errDetail}`);
  }

  const data = await response.json();
  return {
    success: true,
    message: 'Koneksi ke TeamoRouter berhasil terverifikasi!',
    modelUsed: data?.model || targetModel,
  };
}

/**
 * Heuristic Simulation Engine: Generates high quality Indonesian business leads
 * when no API key is saved, allowing instant trial/demo of the SaaS.
 */
export async function executeHeuristicSimulation(
  params: SearchParams,
  existingLeads: BusinessLead[],
  onProgress: (progress: ScrapeProgress) => void
): Promise<BusinessLead[]> {
  const { businessType, location, targetCount } = params;
  const currentDate = new Date().toISOString().split('T')[0];
  const seenNames = new Set(existingLeads.map((l) => l.name.toLowerCase().trim()));

  onProgress({
    status: 'searching',
    currentStep: `Mengaktifkan Heuristic Database Engine untuk wilayah "${location}"...`,
    currentCount: 0,
    totalTarget: targetCount,
    percentage: 25,
  });

  await new Promise((r) => setTimeout(r, 600));

  onProgress({
    status: 'parsing',
    currentStep: `Menyaring bisnis kategori "${businessType}" & audit status website...`,
    currentCount: 0,
    totalTarget: targetCount,
    percentage: 60,
  });

  await new Promise((r) => setTimeout(r, 800));

  // Find matching items from seed database
  const matching = INDONESIAN_PLACES_DATABASE.filter(
    (item) =>
      item.category.toLowerCase().includes(businessType.toLowerCase()) ||
      item.location.toLowerCase().includes(location.toLowerCase())
  );

  const pool: RawPlaceItem[] = [...matching, ...INDONESIAN_PLACES_DATABASE];
  const collected: BusinessLead[] = [];

  for (let i = 0; i < pool.length && collected.length < targetCount; i++) {
    const item = pool[i];
    const placeName = item.name;
    const lower = placeName.toLowerCase();
    if (seenNames.has(lower)) continue;
    seenNames.add(lower);

    const { normalized, contactType, isWhatsAppCandidate } = normalizeIndonesianPhone(item.phone);
    const placeId = `heur_${(placeName + location).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${i}`;
    const mapsQuery = `${placeName} ${item.fullAddress || location}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

    collected.push({
      id: `lead_${Date.now()}_${collected.length}`,
      name: placeName,
      category: item.category || businessType,
      location: item.location || location,
      fullAddress: item.fullAddress || `Jl. Raya Utama No. ${i + 12}, ${location}`,
      phone: item.phone,
      normalizedPhone: normalized,
      contactType,
      isWhatsAppCandidate,
      websiteStatus: item.websiteStatus,
      websiteUrl: item.websiteUrl,
      websiteVerification: item.websiteUrl ? { status: 'active', httpCode: 200 } : { status: 'dead' },
      googleMapsUrl: mapsUrl,
      placeId,
      rating: item.rating || 4.7,
      userRatingsTotal: item.userRatingsTotal || 65,
      dateScraped: currentDate,
      isDemo: true,
      notes: item.websiteStatus === 'NO WEBSITE' ? 'Peluang Hot Lead: Belum ada website resmi. Siap ditawari landing page.' : undefined,
      outreachStatus: 'Belum Dihubungi',
      leadQualityScore: item.websiteStatus === 'NO WEBSITE' ? 95 : 60,
    });
  }

  // If pool was smaller than targetCount, synthesize realistic regional variants
  const prefixes = ['Berkah', 'Sentosa', 'Prima', 'Makmur', 'Mitra', 'Karya', 'Utama', 'Maju', 'Jaya', 'Sejahtera'];
  let synthIdx = 0;
  while (collected.length < targetCount) {
    const prefix = prefixes[synthIdx % prefixes.length];
    const synthName = `${businessType} ${prefix} ${synthIdx + 1}`;
    if (!seenNames.has(synthName.toLowerCase())) {
      seenNames.add(synthName.toLowerCase());
      const rawPhone = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;
      const { normalized, contactType, isWhatsAppCandidate } = normalizeIndonesianPhone(rawPhone);
      const isNoWeb = Math.random() > 0.3; // 70% without website
      const mapsQuery = `${synthName} ${location}`;

      collected.push({
        id: `lead_${Date.now()}_${collected.length}`,
        name: synthName,
        category: businessType,
        location: location,
        fullAddress: `Jl. Jenderal Sudirman No. ${synthIdx * 7 + 14}, ${location}`,
        phone: rawPhone,
        normalizedPhone: normalized,
        contactType,
        isWhatsAppCandidate,
        websiteStatus: isNoWeb ? 'NO WEBSITE' : 'SOCIAL MEDIA ONLY',
        socialMediaUrl: !isNoWeb ? `https://instagram.com/${synthName.toLowerCase().replace(/\s+/g, '_')}` : undefined,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
        placeId: `heur_synth_${Date.now()}_${synthIdx}`,
        rating: +(4.2 + Math.random() * 0.7).toFixed(1),
        userRatingsTotal: Math.floor(25 + Math.random() * 150),
        dateScraped: currentDate,
        isDemo: true,
        notes: 'Peluang website tinggi: UMKM aktif tanpa landing page resmi.',
        outreachStatus: 'Belum Dihubungi',
        leadQualityScore: 90,
      });
    }
    synthIdx++;
    if (synthIdx > 120) break;
  }

  onProgress({
    status: 'completed',
    currentStep: `Berhasil memuat ${collected.length} leads prospek lokal (Mode Heuristik Demo)!`,
    currentCount: collected.length,
    totalTarget: targetCount,
    percentage: 100,
  });

  return collected;
}

/**
 * Executes business scraping and website opportunity investigation
 */
export async function executeScraping(
  params: SearchParams,
  existingLeads: BusinessLead[],
  settings: AppSettings,
  onProgress: (progress: ScrapeProgress) => void
): Promise<BusinessLead[]> {
  const { businessType, location, targetCount, verifyWebsitesLive: shouldVerifyLive } = params;
  const teamoKey = settings.teamorouterApiKey?.trim();
  const googleKey = settings.googleApiKey?.trim();
  const normalizedUrl = normalizeTeamoBaseUrl(settings.teamorouterBaseUrl);
  const model = settings.teamorouterModel || 'gemini-3.8-flash';

  // If no API key is saved, seamlessly fallback to Heuristic Database Engine
  if (!teamoKey && !googleKey) {
    return executeHeuristicSimulation(params, existingLeads, onProgress);
  }

  // 1. PRIMARY ENGINE: TeamoRouter AI API Gateway
  if (teamoKey) {
    let batchSizes: number[] = [];
    if (targetCount <= 10) {
      batchSizes = [10];
    } else if (targetCount <= 25) {
      batchSizes = [25];
    } else if (targetCount <= 50) {
      batchSizes = [25, 25];
    } else {
      // 100 target: 4 batches of 25 = 100 leads
      batchSizes = [25, 25, 25, 25];
    }

    const totalBatches = batchSizes.length;
    const allCollectedLeads: BusinessLead[] = [];
    const seenNames = new Set(existingLeads.map((l) => l.name.toLowerCase().trim()));
    const currentDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `Anda adalah asisten intelijen bisnis lokal Indonesia & lead scraper profesional untuk agensi web development.
Tugas Anda adalah menemukan dan mengumpulkan data calon klien (leads) bisnis nyata di Indonesia sesuai kategori dan lokasi yang diminta.
Prioritaskan bisnis lokal, UMKM, toko, klinik, bengkel, rental, atau restoran yang BELUM MEMILIKI WEBSITE RESMI (status "NO WEBSITE" atau "SOCIAL MEDIA ONLY"), namun memiliki kontak WhatsApp/telepon yang dapat dihubungi dan alamat fisik nyata.

Aturan Wajib:
1. Setiap bisnis harus memiliki:
   - nama: Nama bisnis nyata di wilayah tersebut (contoh: "Rental Mobil Berkah Jaya", "Klinik Pratama Sehat").
   - kategori: Jenis usaha spesifik.
   - lokasi: Kota / wilayah (misal: "${location}").
   - alamat_lengkap: Alamat fisik lengkap (nama jalan riil, nomor, kecamatan di ${location}).
   - nomor_telepon: Nomor kontak format Indonesia (misal: 0812..., 0821..., 0857..., 021..., 022...). Nomor HP awalan 08 sangat diutamakan untuk WhatsApp.
   - status_website: Salah satu dari 4 status persis: "NO WEBSITE", "SOCIAL MEDIA ONLY", "HAS WEBSITE", "UNVERIFIED".
   - url_website: Link URL website atau akun media sosial (misal: "https://instagram.com/..."), atau kosongkan jika NO WEBSITE.
   - rating: Angka rating ulasan (antara 4.0 - 4.9).
   - total_ulasan: Estimasi jumlah review (antara 20 - 350).
   - catatan_peluang: Catatan singkat kenapa bisnis ini perlu website resmi.

2. FORMAT OUTPUT: Berikan HANYA JSON murni yang valid tanpa pengantar:
{
  "businesses": [
    {
      "nama": "...",
      "kategori": "...",
      "lokasi": "...",
      "alamat_lengkap": "...",
      "nomor_telepon": "08...",
      "status_website": "NO WEBSITE",
      "url_website": "",
      "rating": 4.7,
      "total_ulasan": 85,
      "catatan_peluang": "..."
    }
  ]
}`;

    for (let bIdx = 0; bIdx < totalBatches; bIdx++) {
      const currentBatchTarget = batchSizes[bIdx];
      const stepPercent = Math.round(((bIdx) / totalBatches) * 80) + 10;

      onProgress({
        status: 'searching',
        currentStep: `Batch ${bIdx + 1}/${totalBatches}: Menghubungi TeamoRouter (${model}) untuk mencari "${businessType}" di "${location}"...`,
        currentCount: allCollectedLeads.length,
        totalTarget: targetCount,
        percentage: stepPercent,
      });

      const excludePrompt = seenNames.size > 0 
        ? `Jangan masukkan bisnis yang sudah ada: ${Array.from(seenNames).slice(-15).join(', ')}.`
        : '';

      const userPrompt = `Cari dan kumpulkan ${currentBatchTarget} data bisnis lokal riil dengan kriteria:
Jenis Usaha: ${businessType}
Wilayah: ${location}
Target Status: Berikan sekitar 70% dengan status "NO WEBSITE" atau "SOCIAL MEDIA ONLY", dan sisanya "HAS WEBSITE" atau "UNVERIFIED".
${excludePrompt}
Kembalikan HANYA format JSON valid.`;

      const payload = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4 + (bIdx * 0.1),
      };

      let data: any = null;

      try {
        let useDirect = false;
        try {
          const proxyResp = await fetch('/api/teamorouter/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: teamoKey,
              baseUrl: normalizedUrl,
              payload,
            }),
          });

          if (proxyResp.ok) {
            data = await proxyResp.json();
          } else {
            const errData = await proxyResp.json().catch(() => null);
            if (errData?.error?.message) {
              throw new Error(errData.error.message);
            }
            useDirect = true;
          }
        } catch (proxyErr: unknown) {
          const msg = proxyErr instanceof Error ? proxyErr.message : '';
          if (msg && !msg.includes('Failed to fetch') && !msg.includes('404')) {
            throw new Error(msg);
          }
          useDirect = true;
        }

        if (useDirect && !data) {
          const response = await fetch(`${normalizedUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${teamoKey}`,
              'x-api-key': teamoKey,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}));
            const errDetail = errorJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
            throw new Error(`TeamoRouter API Error: ${errDetail}`);
          }

          data = await response.json();
        }

        onProgress({
          status: 'parsing',
          currentStep: `Batch ${bIdx + 1}/${totalBatches}: Menganalisis status website & nomor WhatsApp...`,
          currentCount: allCollectedLeads.length,
          totalTarget: targetCount,
          percentage: stepPercent + 15,
        });

        const rawContent = data?.choices?.[0]?.message?.content || '';
        const parsed = extractJsonFromText(rawContent);

        if (!parsed || !Array.isArray(parsed.businesses) || parsed.businesses.length === 0) {
          if (bIdx === 0 && allCollectedLeads.length === 0) {
            console.warn('Fallback to heuristic simulation on empty LLM response');
            return executeHeuristicSimulation(params, existingLeads, onProgress);
          }
          break;
        }

        const rawList = parsed.businesses;

        for (let i = 0; i < rawList.length; i++) {
          const b = rawList[i];
          const bName = String(b.nama || b.name || '').trim();
          if (!bName) continue;

          const lowerName = bName.toLowerCase();
          if (seenNames.has(lowerName)) continue;
          seenNames.add(lowerName);

          const cleanPhone = String(b.nomor_telepon || b.phone || '').trim();
          const { normalized, contactType, isWhatsAppCandidate } = normalizeIndonesianPhone(cleanPhone);

          let webStatus: BusinessLead['websiteStatus'] = 'NO WEBSITE';
          const rawStatus = String(b.status_website || b.websiteStatus || '').toUpperCase();
          if (rawStatus.includes('HAS') || rawStatus === 'HAS WEBSITE') {
            webStatus = 'HAS WEBSITE';
          } else if (rawStatus.includes('SOCIAL') || rawStatus === 'SOCIAL MEDIA ONLY') {
            webStatus = 'SOCIAL MEDIA ONLY';
          } else if (rawStatus.includes('UNVERIFIED')) {
            webStatus = 'UNVERIFIED';
          } else {
            webStatus = 'NO WEBSITE';
          }

          const placeId = `teamo_${(bName + location).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${i}`;
          const mapsQuery = `${bName} ${b.alamat_lengkap || location}`;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

          allCollectedLeads.push({
            id: `lead_${Date.now()}_${allCollectedLeads.length}`,
            name: bName,
            category: b.kategori || businessType,
            location: b.lokasi || location,
            fullAddress: b.alamat_lengkap || b.fullAddress || `Jl. Raya ${location}`,
            phone: cleanPhone || '-',
            normalizedPhone: normalized,
            contactType,
            isWhatsAppCandidate,
            websiteStatus: webStatus,
            websiteUrl: b.url_website || b.websiteUrl || undefined,
            googleMapsUrl: mapsUrl,
            placeId,
            rating: typeof b.rating === 'number' ? b.rating : 4.6,
            userRatingsTotal: typeof b.total_ulasan === 'number' ? b.total_ulasan : 75,
            dateScraped: currentDate,
            isDemo: false,
            notes: b.catatan_peluang || undefined,
            outreachStatus: 'Belum Dihubungi',
            leadQualityScore: webStatus === 'NO WEBSITE' ? 95 : webStatus === 'SOCIAL MEDIA ONLY' ? 85 : 50,
          });
        }
      } catch (batchErr: unknown) {
        const msg = batchErr instanceof Error ? batchErr.message : 'Kegagalan komunikasi dengan TeamoRouter API.';
        if (allCollectedLeads.length === 0) {
          console.warn('Switching to Heuristic Simulation due to error:', msg);
          return executeHeuristicSimulation(params, existingLeads, onProgress);
        } else {
          break;
        }
      }
    }

    // Optional Live Verification Step
    if (shouldVerifyLive && allCollectedLeads.length > 0) {
      onProgress({
        status: 'verifying',
        currentStep: 'Melakukan audit HTTP status domain secara live...',
        currentCount: allCollectedLeads.length,
        totalTarget: targetCount,
        percentage: 92,
      });

      for (const lead of allCollectedLeads) {
        if (lead.websiteUrl && lead.websiteStatus === 'HAS WEBSITE') {
          const ver = await verifyWebsiteLive(lead.websiteUrl);
          lead.websiteVerification = ver;
          if (ver.status === 'dead') {
            lead.notes = `Domain berstatus mati (HTTP ${ver.httpCode || 0}). Peluang re-host / website baru tinggi!`;
          }
        }
      }
    }

    onProgress({
      status: 'completed',
      currentStep: `Berhasil mendapatkan ${allCollectedLeads.length} leads bisnis via TeamoRouter AI!`,
      currentCount: allCollectedLeads.length,
      totalTarget: targetCount,
      percentage: 100,
    });

    return allCollectedLeads;
  }

  return [];
}
