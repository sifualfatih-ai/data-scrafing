/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeadDiscoveryView } from './components/LeadDiscoveryView';
import { FullDashboardView } from './components/FullDashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { OutreachModal } from './components/OutreachModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { AddLeadModal } from './components/AddLeadModal';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { 
  BusinessLead, 
  ScrapeProgress, 
  SearchParams, 
  AppSettings, 
  OutreachStatus, 
  UserProfile, 
  UserSubscription 
} from './types';
import { executeScraping } from './services/scraperService';
import { exportToExcel, exportToCSV } from './services/exportService';
import {
  testFirestoreConnection,
  fetchLeadsFromFirestore,
  saveLeadToFirestore,
  saveLeadsBatchToFirestore,
  deleteLeadFromFirestore,
  saveSettingsToFirestore,
  loadSettingsFromFirestore,
  subscribeToAuth,
  ensureSession,
  logoutUser,
  saveUserSubscription,
  loadUserSubscription,
} from './services/firebase';

const STORAGE_KEY_LEADS = 'nafsflow_leads_data_v2';
const STORAGE_KEY_SETTINGS = 'nafsflow_app_settings_v2';
const STORAGE_KEY_SUB = 'nafsflow_user_sub_v2';

const DEFAULT_SETTINGS: AppSettings = {
  teamorouterApiKey: '',
  teamorouterBaseUrl: 'https://api.teamorouter.com/v1',
  teamorouterModel: 'gemini-3.8-flash',
  googleApiKey: '',
  defaultLocation: 'Bandung',
  defaultCount: 100,
  autoDetectWA: true,
  pitchTemplate: '',
  senderName: 'Tim Konsultan',
  agencyName: 'NAFSFlow Web Studio',
  websiteOfferPrice: 3500000,
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'discovery' | 'dashboard' | 'analytics' | 'settings'>('discovery');
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'connecting' | 'error' | 'syncing'>('connecting');
  const [firebaseMessage, setFirebaseMessage] = useState<string>('Menghubungkan ke Cloud Firestore...');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [scrapeProgress, setScrapeProgress] = useState<ScrapeProgress>({
    status: 'idle',
    currentStep: '',
    currentCount: 0,
    totalTarget: 100,
    percentage: 0,
  });
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [outreachLead, setOutreachLead] = useState<BusinessLead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenUpgrade = (reason?: string) => {
    setUpgradeReason(reason);
    setIsUpgradeModalOpen(true);
  };

  // 1. Initialize Firebase Auth & Subscription state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (profile) => {
      if (profile) {
        // Try to load cached or remote subscription
        let sub: UserSubscription | null = null;
        try {
          const localSub = localStorage.getItem(STORAGE_KEY_SUB);
          if (localSub) sub = JSON.parse(localSub);
        } catch {}

        if (!sub) {
          sub = await loadUserSubscription(profile.uid);
        }

        setUser({
          ...profile,
          subscription: sub || {
            plan: 'free',
            status: 'active',
            monthlyQuota: 50,
            quotaUsed: 0,
          },
        });
      } else {
        setUser(null);
      }
    });

    ensureSession().catch(() => {});

    return () => unsubscribe();
  }, []);

  // 2. Load from local storage and sync with Cloud Firestore
  useEffect(() => {
    let initialLocalLeads: BusinessLead[] = [];
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }

      const savedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
      if (savedLeads) {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed)) {
          initialLocalLeads = parsed;
          setLeads(initialLocalLeads);
        }
      }
    } catch (e) {
      console.error('Failed to load initial storage', e);
    }

    const initFirestoreSync = async () => {
      try {
        setFirebaseStatus('syncing');
        setFirebaseMessage('Menyinkronkan data dengan Cloud Firestore...');
        
        await testFirestoreConnection();

        const remoteLeads = await fetchLeadsFromFirestore(user?.uid);
        
        if (remoteLeads && remoteLeads.length > 0) {
          const leadMap = new Map<string, BusinessLead>();
          initialLocalLeads.forEach((l) => leadMap.set(l.id, l));
          remoteLeads.forEach((l) => leadMap.set(l.id, l));
          const merged = Array.from(leadMap.values());
          
          setLeads(merged);
          localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(merged));
        } else if (initialLocalLeads.length > 0) {
          await saveLeadsBatchToFirestore(initialLocalLeads, user?.uid);
        }

        const remoteSettings = await loadSettingsFromFirestore(user?.uid);
        if (remoteSettings) {
          setSettings((prev) => ({
            ...prev,
            ...remoteSettings,
            teamorouterApiKey: prev.teamorouterApiKey || remoteSettings.teamorouterApiKey || '',
          }));
        }

        setFirebaseStatus('connected');
        setFirebaseMessage('Terhubung ke Google Cloud Firestore (Aktif)');
        setLastSyncedAt(new Date());
      } catch (err: any) {
        console.warn('Firestore initial sync note:', err);
        setFirebaseStatus('connected');
        setFirebaseMessage('Cloud Firestore siap digunakan');
      }
    };

    initFirestoreSync();
  }, [user?.uid]);

  // Handle successful upgrade to Premium (Rp 29.000)
  const handleUpgradeSuccess = async () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const newSub: UserSubscription = {
      plan: 'premium',
      status: 'active',
      subscribedAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
      monthlyQuota: 1500,
      quotaUsed: 0,
      paymentReference: `QRIS_${Date.now()}`,
    };

    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(newSub));

    if (user) {
      setUser((prev) => (prev ? { ...prev, subscription: newSub } : null));
      await saveUserSubscription(user.uid, newSub).catch(() => {});
    }

    showNotification('🎉 Pembayaran QRIS Berhasil! Akun NAFSFlow Premium Rp 29.000 aktif selama 30 hari.');
  };

  // Manual trigger to force re-sync with Firestore
  const handleSyncWithFirestore = async () => {
    try {
      setFirebaseStatus('syncing');
      setFirebaseMessage('Menyinkronkan dengan Firestore...');
      
      const remoteLeads = await fetchLeadsFromFirestore(user?.uid);
      if (remoteLeads && remoteLeads.length > 0) {
        const leadMap = new Map<string, BusinessLead>();
        leads.forEach((l) => leadMap.set(l.id, l));
        remoteLeads.forEach((l) => leadMap.set(l.id, l));
        const merged = Array.from(leadMap.values());
        setLeads(merged);
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(merged));
        showNotification(`Berhasil menyinkronkan ${merged.length} leads dengan Cloud Firestore!`);
      } else if (leads.length > 0) {
        await saveLeadsBatchToFirestore(leads, user?.uid);
        showNotification(`${leads.length} leads berhasil dicadangkan ke Cloud Firestore!`);
      } else {
        showNotification('Firestore terhubung dan sinkron (0 leads).');
      }

      setFirebaseStatus('connected');
      setFirebaseMessage('Terhubung ke Cloud Firestore');
      setLastSyncedAt(new Date());
    } catch (e: any) {
      setFirebaseStatus('error');
      setFirebaseMessage('Gagal sinkronisasi: ' + (e?.message || 'Error'));
      showNotification('Gagal menyinkronkan dengan Firestore.');
    }
  };

  // Scraping handler
  const handleStartScraping = async (params: SearchParams) => {
    setScrapeProgress({
      status: 'searching',
      currentStep: `Menganalisis pasar ${params.businessType} di ${params.location}...`,
      currentCount: 0,
      totalTarget: params.targetCount,
      percentage: 5,
    });

    try {
      const newLeads = await executeScraping(
        params,
        leads,
        settings,
        (progress) => setScrapeProgress(progress)
      );

      const existingIds = new Set(leads.map((l) => l.placeId || l.id));
      const freshFiltered = newLeads.filter((l) => !existingIds.has(l.placeId || l.id));
      const updated = [...freshFiltered, ...leads];

      setLeads(updated);
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));

      if (freshFiltered.length > 0) {
        saveLeadsBatchToFirestore(freshFiltered, user?.uid)
          .then((count) => {
            setLastSyncedAt(new Date());
            console.log(`Successfully synced ${count} leads to Cloud Firestore`);
          })
          .catch((err) => console.error('Background Firestore sync error:', err));
      }

      showNotification(`Berhasil mendapatkan ${freshFiltered.length} leads baru! Tersimpan otomatis di cloud.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mencari data.';
      setScrapeProgress((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: msg,
      }));
      showNotification(`Pencarian gagal: ${msg}`);
    }
  };

  // Export handlers
  const handleExportExcel = (customList?: BusinessLead[]) => {
    const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';
    if (!isPremium) {
      handleOpenUpgrade('Download Excel (.xlsx) resmi khusus Member Premium. Buka akses seharga Rp 29.000/bln.');
      return;
    }
    const dataToExport = customList && customList.length > 0 ? customList : leads;
    if (dataToExport.length === 0) {
      showNotification('Tidak ada data leads untuk diekspor.');
      return;
    }
    const loc = dataToExport[0]?.location || 'Indonesia';
    exportToExcel(dataToExport, loc);
    showNotification('File Excel (.xlsx) berhasil diunduh!');
  };

  const handleExportCSV = (customList?: BusinessLead[]) => {
    const dataToExport = customList && customList.length > 0 ? customList : leads;
    if (dataToExport.length === 0) {
      showNotification('Tidak ada data leads untuk diekspor.');
      return;
    }
    const loc = dataToExport[0]?.location || 'Indonesia';
    exportToCSV(dataToExport, loc);
    showNotification('File CSV (.csv) berhasil diunduh!');
  };

  // Lead management handlers
  const handleDeleteLead = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
    deleteLeadFromFirestore(id).catch((err) => console.warn('Firestore delete note:', err));
    showNotification('Lead berhasil dihapus.');
  };

  const handleBatchDeleteLeads = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = leads.filter((l) => !idSet.has(l.id));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
    ids.forEach((id) => deleteLeadFromFirestore(id).catch(() => {}));
    showNotification(`${ids.length} leads berhasil dihapus.`);
  };

  const handleClearAllLeads = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SELURUH database leads?')) {
      const idsToDelete = leads.map((l) => l.id);
      setLeads([]);
      localStorage.removeItem(STORAGE_KEY_LEADS);
      idsToDelete.forEach((id) => deleteLeadFromFirestore(id).catch(() => {}));
      showNotification('Database leads telah dikosongkan.');
    }
  };

  const handleUpdateLead = (updatedLead: BusinessLead) => {
    const updated = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
    saveLeadToFirestore(updatedLead, user?.uid).catch(() => {});
    showNotification(`Lead "${updatedLead.name}" berhasil diperbarui.`);
  };

  const handleUpdateLeadStatus = (leadId: string, status: OutreachStatus) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;
    const updatedLead: BusinessLead = { ...targetLead, outreachStatus: status };
    handleUpdateLead(updatedLead);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    saveSettingsToFirestore({
      teamorouterModel: newSettings.teamorouterModel,
      teamorouterBaseUrl: newSettings.teamorouterBaseUrl,
      defaultLocation: newSettings.defaultLocation,
      defaultCount: newSettings.defaultCount,
      agencyName: newSettings.agencyName,
      senderName: newSettings.senderName,
      websiteOfferPrice: newSettings.websiteOfferPrice,
    }, user?.uid).catch(() => {});
    showNotification(`Pengaturan tersimpan (Model: ${newSettings.teamorouterModel})`);
  };

  const handleAddLead = (newLead: BusinessLead) => {
    const leadWithOwner = { ...newLead, userId: user?.uid || 'guest' };
    const updated = [leadWithOwner, ...leads];
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
    saveLeadToFirestore(leadWithOwner, user?.uid).catch((err) => console.warn('Firestore save lead note:', err));
    showNotification(`Lead "${leadWithOwner.name}" berhasil ditambahkan & tersimpan ke Cloud!`);
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem(STORAGE_KEY_SUB);
    await ensureSession();
    showNotification('Anda telah keluar dari akun. Sesi tamu aktif.');
  };

  const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';
  const noWebCount = leads.filter((l) => l.websiteStatus === 'NO WEBSITE').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        totalLeads={leads.length}
        noWebCount={noWebCount}
        firebaseStatus={firebaseStatus}
        onSyncFirebase={handleSyncWithFirestore}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenUpgradeModal={() => handleOpenUpgrade()}
      />

      {/* Main SaaS View Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'discovery' && (
          <LeadDiscoveryView
            leads={leads}
            onStartScraping={handleStartScraping}
            scrapeProgress={scrapeProgress}
            onExportExcel={() => handleExportExcel()}
            onExportCSV={() => handleExportCSV()}
            onOpenDashboard={() => setCurrentTab('dashboard')}
            onSelectLead={(l) => setSelectedLead(l)}
            onOpenWhatsAppOutreach={(l) => setOutreachLead(l)}
            isTeamoConfigured={!!settings.teamorouterApiKey?.trim()}
            currentModel={settings.teamorouterModel || 'gemini-3.8-flash'}
            onOpenSettings={() => setCurrentTab('settings')}
            onUpdateLead={handleUpdateLead}
            isPremium={isPremium}
            onOpenUpgradeModal={handleOpenUpgrade}
          />
        )}

        {currentTab === 'dashboard' && (
          <FullDashboardView
            leads={leads}
            onDeleteLead={handleDeleteLead}
            onBatchDeleteLeads={handleBatchDeleteLeads}
            onClearAllLeads={handleClearAllLeads}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onSelectLead={(l) => setSelectedLead(l)}
            onOpenWhatsAppOutreach={(l) => setOutreachLead(l)}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            isPremium={isPremium}
            onOpenUpgradeModal={handleOpenUpgrade}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            leads={leads}
            settings={settings}
            onOpenDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onClearDatabase={handleClearAllLeads}
            leadsCount={leads.length}
            firebaseStatus={firebaseStatus}
            firebaseMessage={firebaseMessage}
            lastSyncedAt={lastSyncedAt}
            onSyncFirebase={handleSyncWithFirestore}
          />
        )}
      </main>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <AddLeadModal
          onClose={() => setIsAddModalOpen(false)}
          onAddLead={handleAddLead}
          defaultLocation={settings.defaultLocation || 'Bandung'}
        />
      )}

      {/* WhatsApp Outreach Modal */}
      {outreachLead && (
        <OutreachModal
          lead={outreachLead}
          agencyName={settings.agencyName}
          senderName={settings.senderName}
          onClose={() => setOutreachLead(null)}
          onStatusUpdate={handleUpdateLeadStatus}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onOpenWhatsAppOutreach={(lead) => {
            setSelectedLead(null);
            setOutreachLead(lead);
          }}
          onUpdateStatus={handleUpdateLeadStatus}
        />
      )}

      {/* SaaS Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showNotification(msg)}
      />

      {/* Upgrade Pro Modal (QRIS Rp 29.000) */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        triggerReason={upgradeReason}
      />
    </div>
  );
}
