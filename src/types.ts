/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WebsiteStatus = 'NO WEBSITE' | 'HAS WEBSITE' | 'SOCIAL MEDIA ONLY' | 'UNVERIFIED';

export type ContactType = 'WHATSAPP' | 'LANDLINE' | 'NONE';

export type OutreachStatus = 
  | 'Belum Dihubungi' 
  | 'Terkirim' 
  | 'Tertarik' 
  | 'Follow Up' 
  | 'Menolak' 
  | 'Closing (Won)';

export interface WebsiteVerification {
  status: 'active' | 'dead' | 'redirect' | 'untested';
  httpCode?: number;
  checkedAt?: string;
  error?: string;
}

export interface BusinessLead {
  id: string;
  userId?: string;
  name: string;
  category: string;
  location: string;
  fullAddress: string;
  phone: string;
  normalizedPhone: string;
  contactType: ContactType;
  isWhatsAppCandidate: boolean;
  websiteStatus: WebsiteStatus;
  websiteUrl?: string;
  socialMediaUrl?: string;
  websiteVerification?: WebsiteVerification;
  googleMapsUrl: string;
  placeId: string;
  rating?: number;
  userRatingsTotal?: number;
  dateScraped: string;
  isDemo: boolean;
  notes?: string;
  outreachStatus?: OutreachStatus;
  leadQualityScore?: number;
}

export interface SearchParams {
  businessType: string;
  location: string;
  targetCount: number;
  verifyWebsitesLive?: boolean;
}

export interface AppSettings {
  teamorouterApiKey: string;
  teamorouterBaseUrl: string;
  teamorouterModel: string;
  googleApiKey: string;
  defaultLocation: string;
  defaultCount: number;
  autoDetectWA: boolean;
  pitchTemplate: string;
  senderName: string;
  agencyName: string;
  websiteOfferPrice?: number;
}

export interface ScrapeProgress {
  status: 'idle' | 'searching' | 'parsing' | 'verifying' | 'completed' | 'error';
  currentStep: string;
  currentCount: number;
  totalTarget: number;
  percentage: number;
  errorMessage?: string;
}

export type PlanType = 'free' | 'premium';

export interface UserSubscription {
  plan: PlanType;
  status: 'active' | 'expired' | 'trial';
  subscribedAt?: string;
  expiresAt?: string;
  paymentReference?: string;
  monthlyQuota: number;
  quotaUsed: number;
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  photoURL?: string | null;
  subscription?: UserSubscription;
}

/**
 * Masks the last 4 digits of a phone number for Free users
 * e.g. "+62 812-3456-7890" -> "+62 812-3456-••••"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || phone === '-') return '-';
  const clean = phone.trim();
  if (clean.length <= 6) return '••••••';
  return clean.slice(0, -4) + '••••';
}
