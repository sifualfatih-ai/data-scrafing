/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { BusinessLead, AppSettings, UserProfile, UserSubscription } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    isAnonymous: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operation: OperationType,
  path: string | null = null,
): FirestoreErrorInfo {
  const err = error as { code?: string; message?: string };
  const info: FirestoreErrorInfo = {
    error: `${err.code || 'UNKNOWN'}: ${err.message || 'An unknown error occurred'}`,
    operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
  };
  console.error(`Firestore Error [${operation}] at ${path || 'unknown'}:`, JSON.stringify(info));
  return info;
}

/**
 * Maps Firebase User to UserProfile
 */
export function mapFirebaseUser(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.isAnonymous ? 'Pengguna Tamu (Guest)' : user.email?.split('@')[0] || 'Member'),
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL,
  };
}

/**
 * Listen to Auth State Changes
 */
export function subscribeToAuth(callback: (profile: UserProfile | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
}

/**
 * Ensure an active session (signs in anonymously if no user is signed in)
 */
export async function ensureSession(): Promise<UserProfile> {
  if (auth.currentUser) {
    return mapFirebaseUser(auth.currentUser)!;
  }
  const cred = await signInAnonymously(auth);
  return mapFirebaseUser(cred.user)!;
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(cred.user)!;
}

/**
 * Register with email and password
 */
export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return mapFirebaseUser(cred.user)!;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Test server-side connection to the provisioned Firestore database
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; projectId: string }> {
  try {
    await getDocFromServer(doc(db, 'leads', '__connection_ping__'));
    return {
      success: true,
      message: 'Terkoneksi ke Firestore aktif (' + firebaseConfig.projectId + ')',
      projectId: firebaseConfig.projectId
    };
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.code === 'not-found') {
      return {
        success: true,
        message: 'Terkoneksi ke Firestore aktif (' + firebaseConfig.projectId + ')',
        projectId: firebaseConfig.projectId
      };
    }
    const errorInfo = handleFirestoreError(error, OperationType.READ, 'leads/__connection_ping__');
    return {
      success: false,
      message: errorInfo.error,
      projectId: firebaseConfig.projectId
    };
  }
}

/**
 * Fetch leads from Firestore. If userId is provided, queries only for that user.
 */
export async function fetchLeadsFromFirestore(targetUserId?: string): Promise<BusinessLead[]> {
  try {
    const leadsCollection = collection(db, 'leads');
    const uid = targetUserId || auth.currentUser?.uid;
    
    // If authenticated, we query by userId; otherwise load global/tenant leads
    const q = uid ? query(leadsCollection, where('userId', '==', uid)) : leadsCollection;
    const snapshot = await getDocs(q);
    const leads: BusinessLead[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      leads.push({
        id: docSnap.id,
        userId: data.userId || uid,
        name: data.name || '',
        category: data.category || '',
        location: data.location || '',
        fullAddress: data.fullAddress || data.location || '',
        phone: data.phone || '',
        normalizedPhone: data.normalizedPhone || data.phone || '',
        contactType: data.contactType || (data.hasWhatsapp ? 'WHATSAPP' : 'LANDLINE'),
        isWhatsAppCandidate: Boolean(data.hasWhatsapp ?? data.isWhatsAppCandidate),
        websiteStatus: data.websiteStatus || 'UNVERIFIED',
        websiteUrl: data.websiteUrl || undefined,
        websiteVerification: data.websiteVerification,
        googleMapsUrl: data.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name || '')}`,
        placeId: data.placeId || docSnap.id,
        rating: data.rating,
        userRatingsTotal: data.userRatingsTotal,
        dateScraped: data.scrapedAt || data.dateScraped || new Date().toISOString(),
        isDemo: Boolean(data.isDemo),
        notes: data.notes,
        outreachStatus: data.outreachStatus || 'Belum Dihubungi',
        leadQualityScore: data.leadQualityScore,
      });
    });

    return leads;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leads');
    throw error;
  }
}

/**
 * Save or update a single lead in Firestore
 */
export async function saveLeadToFirestore(lead: BusinessLead, targetUserId?: string): Promise<void> {
  const path = `leads/${lead.id}`;
  const uid = targetUserId || auth.currentUser?.uid || 'guest';
  try {
    const leadRef = doc(db, 'leads', lead.id);
    await setDoc(leadRef, {
      id: lead.id,
      userId: lead.userId || uid,
      name: lead.name,
      category: lead.category,
      location: lead.location,
      fullAddress: lead.fullAddress,
      phone: lead.phone,
      normalizedPhone: lead.normalizedPhone,
      contactType: lead.contactType,
      hasWhatsapp: lead.isWhatsAppCandidate,
      isWhatsAppCandidate: lead.isWhatsAppCandidate,
      websiteStatus: lead.websiteStatus,
      websiteUrl: lead.websiteUrl || null,
      websiteVerification: lead.websiteVerification || null,
      googleMapsUrl: lead.googleMapsUrl,
      placeId: lead.placeId,
      rating: lead.rating ?? null,
      userRatingsTotal: lead.userRatingsTotal ?? null,
      scrapedAt: lead.dateScraped,
      dateScraped: lead.dateScraped,
      isDemo: Boolean(lead.isDemo),
      notes: lead.notes || '',
      outreachStatus: lead.outreachStatus || 'Belum Dihubungi',
      leadQualityScore: lead.leadQualityScore ?? null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Batch save multiple leads to Firestore
 */
export async function saveLeadsBatchToFirestore(leads: BusinessLead[], targetUserId?: string): Promise<number> {
  if (!leads.length) return 0;
  const uid = targetUserId || auth.currentUser?.uid || 'guest';
  
  try {
    const chunkSize = 400;
    let savedCount = 0;

    for (let i = 0; i < leads.length; i += chunkSize) {
      const chunk = leads.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const lead of chunk) {
        const leadRef = doc(db, 'leads', lead.id);
        batch.set(leadRef, {
          id: lead.id,
          userId: lead.userId || uid,
          name: lead.name,
          category: lead.category,
          location: lead.location,
          fullAddress: lead.fullAddress,
          phone: lead.phone,
          normalizedPhone: lead.normalizedPhone,
          contactType: lead.contactType,
          hasWhatsapp: lead.isWhatsAppCandidate,
          isWhatsAppCandidate: lead.isWhatsAppCandidate,
          websiteStatus: lead.websiteStatus,
          websiteUrl: lead.websiteUrl || null,
          websiteVerification: lead.websiteVerification || null,
          googleMapsUrl: lead.googleMapsUrl,
          placeId: lead.placeId,
          rating: lead.rating ?? null,
          userRatingsTotal: lead.userRatingsTotal ?? null,
          scrapedAt: lead.dateScraped,
          dateScraped: lead.dateScraped,
          isDemo: Boolean(lead.isDemo),
          notes: lead.notes || '',
          outreachStatus: lead.outreachStatus || 'Belum Dihubungi',
          leadQualityScore: lead.leadQualityScore ?? null,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      savedCount += chunk.length;
    }

    return savedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'leads (batch)');
    throw error;
  }
}

/**
 * Delete a single lead from Firestore
 */
export async function deleteLeadFromFirestore(id: string): Promise<void> {
  const path = `leads/${id}`;
  try {
    const leadRef = doc(db, 'leads', id);
    await deleteDoc(leadRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Save settings to Firestore (user-scoped or default)
 */
export async function saveSettingsToFirestore(settings: Partial<AppSettings>, targetUserId?: string): Promise<void> {
  const docId = targetUserId || auth.currentUser?.uid || 'default';
  const path = `app_settings/${docId}`;
  try {
    const settingsRef = doc(db, 'app_settings', docId);
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Load settings from Firestore
 */
export async function loadSettingsFromFirestore(targetUserId?: string): Promise<Partial<AppSettings> | null> {
  const docId = targetUserId || auth.currentUser?.uid || 'default';
  const path = `app_settings/${docId}`;
  try {
    const settingsRef = doc(db, 'app_settings', docId);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as Partial<AppSettings>;
    }
    // Fallback to 'default' if user doc doesn't exist
    if (docId !== 'default') {
      const defaultSnap = await getDoc(doc(db, 'app_settings', 'default'));
      if (defaultSnap.exists()) {
        return defaultSnap.data() as Partial<AppSettings>;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.READ, path);
    return null;
  }
}

/**
 * Save user subscription to Firestore
 */
export async function saveUserSubscription(userId: string, subscription: UserSubscription): Promise<void> {
  const path = `users/${userId}/subscription/current`;
  try {
    const subRef = doc(db, 'users', userId, 'subscription', 'current');
    await setDoc(subRef, {
      ...subscription,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    // Fallback to local storage
  }
}

/**
 * Load user subscription from Firestore
 */
export async function loadUserSubscription(userId: string): Promise<UserSubscription | null> {
  const path = `users/${userId}/subscription/current`;
  try {
    const subRef = doc(db, 'users', userId, 'subscription', 'current');
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      return snap.data() as UserSubscription;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.READ, path);
    return null;
  }
}
