/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Key, 
  Save, 
  Check, 
  Trash2, 
  Building2, 
  Info,
  Server,
  Zap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Cloud,
  Database,
  RefreshCw
} from 'lucide-react';
import { AppSettings } from '../types';
import { testTeamoRouterConnection, normalizeTeamoBaseUrl } from '../services/scraperService';
import { TEAMOROUTER_MODELS, PROVIDERS, TeamoModel } from '../data/teamorouterModels';
import { testFirestoreConnection } from '../services/firebase';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearDatabase: () => void;
  leadsCount: number;
  firebaseStatus?: 'connected' | 'connecting' | 'error' | 'syncing';
  firebaseMessage?: string;
  lastSyncedAt?: Date | null;
  onSyncFirebase?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onClearDatabase,
  leadsCount,
  firebaseStatus = 'connected',
  firebaseMessage = 'Terhubung ke Cloud Firestore',
  lastSyncedAt,
  onSyncFirebase,
}) => {
  const [formData, setFormData] = useState<AppSettings>({
    ...settings,
    teamorouterBaseUrl: settings.teamorouterBaseUrl || 'https://api.teamorouter.com',
    teamorouterModel: settings.teamorouterModel || 'gemini-3.8-flash',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingFirestore, setTestingFirestore] = useState(false);
  const [firestoreTestResult, setFirestoreTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [useCustomModel, setUseCustomModel] = useState(
    !TEAMOROUTER_MODELS.some((m) => m.id === (settings.teamorouterModel || 'gemini-3.8-flash'))
  );

  // Sync formData whenever settings prop changes (e.g. from storage load or external update)
  React.useEffect(() => {
    const currentModel = settings.teamorouterModel || 'gemini-3.8-flash';
    setFormData((prev) => ({
      ...prev,
      ...settings,
      teamorouterBaseUrl: settings.teamorouterBaseUrl || 'https://api.teamorouter.com',
      teamorouterModel: currentModel,
    }));
    setUseCustomModel(!TEAMOROUTER_MODELS.some((m) => m.id === currentModel));
  }, [settings]);

  // Immediately persist model change to settings & local storage
  const handleModelChange = (newModelId: string) => {
    const updated = {
      ...formData,
      teamorouterModel: newModelId,
      teamorouterBaseUrl: normalizeTeamoBaseUrl(formData.teamorouterBaseUrl),
    };
    setFormData(updated);
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleToggleCustomModel = () => {
    const nextCustom = !useCustomModel;
    setUseCustomModel(nextCustom);
    if (!nextCustom) {
      // Switching to dropdown: ensure model is valid in list
      const isValid = TEAMOROUTER_MODELS.some((m) => m.id === formData.teamorouterModel);
      if (!isValid) {
        handleModelChange('gemini-3.8-flash');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      teamorouterBaseUrl: normalizeTeamoBaseUrl(formData.teamorouterBaseUrl),
      teamorouterModel: formData.teamorouterModel || 'gemini-3.8-flash',
    };
    onSaveSettings(cleanData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestTeamoRouter = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const cleanData = {
        ...formData,
        teamorouterBaseUrl: normalizeTeamoBaseUrl(formData.teamorouterBaseUrl),
        teamorouterModel: formData.teamorouterModel || 'gemini-3.8-flash',
      };
      const res = await testTeamoRouterConnection(
        cleanData.teamorouterApiKey,
        cleanData.teamorouterBaseUrl || 'https://api.teamorouter.com',
        cleanData.teamorouterModel
      );
      // Auto-save verified settings immediately so scraping works right away
      onSaveSettings(cleanData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      setTestResult({
        success: true,
        message: res.message,
        details: `Model aktif: ${cleanData.teamorouterModel} • Pengaturan otomatis tersimpan dan siap digunakan untuk scraping!`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Koneksi ke TeamoRouter gagal.';
      setTestResult({
        success: false,
        message: errMsg,
        details: errMsg.includes('401') || errMsg.includes('auth') || errMsg.includes('key')
          ? 'Periksa kembali TeamoRouter API Key Anda (pastikan berawalan sk-teamo-...).'
          : 'Jika endpoint gagal, pastikan Base URL mengarah ke https://api.teamorouter.com',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestFirestore = async () => {
    setTestingFirestore(true);
    setFirestoreTestResult(null);
    try {
      const res = await testFirestoreConnection();
      setFirestoreTestResult({
        success: res.success,
        message: res.message
      });
    } catch (e: any) {
      setFirestoreTestResult({
        success: false,
        message: e?.message || 'Gagal terhubung ke Cloud Firestore'
      });
    } finally {
      setTestingFirestore(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengaturan & Konfigurasi API</h2>
        <p className="text-xs text-slate-500 mt-1">
          Aplikasi menggunakan API gateway dari <strong>TeamoRouter</strong> (https://api.teamorouter.com) dan database cloud <strong>Firebase Firestore</strong> bawaan Google AI Studio.
        </p>
      </div>

      {/* Google AI Studio Firebase Firestore Card */}
      <div className="bg-white rounded-xl border border-amber-200/90 p-5 shadow-2xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
          <Cloud className="w-3 h-3 text-white" />
          <span>Active Cloud DB</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Google AI Studio Firebase (Cloud Firestore)</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Terkoneksi & Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Database noSQL persisten resmi Google AI Studio. Seluruh leads tersimpan permanen di cloud dan terlindungi aturan keamanan Firestore Rules.
            </p>
          </div>
        </div>

        {/* Configuration details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-200/70 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Firebase Project ID</span>
            <span className="text-slate-800 font-semibold">lustrous-potion-vk6n5</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Koleksi Aktif</span>
            <span className="text-slate-800">/leads & /app_settings</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Firestore Database ID</span>
            <span className="text-slate-700 text-[11px] break-all">ai-studio-nafsflowleadfind-b17ecebc-34bf-4df3-a390-e324d8de676d</span>
          </div>
        </div>

        {/* Actions & Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestFirestore}
              disabled={testingFirestore}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {testingFirestore ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{testingFirestore ? 'Menguji Server...' : 'Tes Koneksi Firestore'}</span>
            </button>

            {onSyncFirebase && (
              <button
                type="button"
                onClick={onSyncFirebase}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${firebaseStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Sekarang</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            {lastSyncedAt ? (
              <span>Terakhir sinkron: {lastSyncedAt.toLocaleTimeString('id-ID')}</span>
            ) : (
              <span>Status: {firebaseMessage}</span>
            )}
          </div>
        </div>

        {firestoreTestResult && (
          <div
            className={`text-xs p-3 rounded-lg flex items-center gap-2 transition-all ${
              firestoreTestResult.success
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {firestoreTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{firestoreTestResult.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TeamoRouter API Card (Primary Provider) */}
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Primary API</span>
          </div>

          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">TeamoRouter API Gateway</h3>
              <a 
                href="https://teamorouter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                <span>https://api.teamorouter.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">TeamoRouter API Key *</label>
            <input
              type="password"
              value={formData.teamorouterApiKey}
              onChange={(e) => setFormData({ ...formData, teamorouterApiKey: e.target.value })}
              placeholder="sk-teamo-..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <p className="text-[10px] text-slate-400">
              Dapatkan API key dari dasbor TeamoRouter Anda (awalan sk-teamo-...).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Base URL Endpoint</label>
              <input
                type="text"
                value={formData.teamorouterBaseUrl}
                onChange={(e) => setFormData({ ...formData, teamorouterBaseUrl: e.target.value })}
                placeholder="https://api.teamorouter.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <p className="text-[10px] text-slate-400">
                Otomatis dinormalisasi ke endpoint /v1
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Model AI ({TEAMOROUTER_MODELS.length} Model Tersedia)</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleCustomModel}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  {useCustomModel ? '← Pilih dari Daftar' : '✎ Ketik Manual'}
                </button>
              </div>

              {useCustomModel ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={formData.teamorouterModel}
                    onChange={(e) => setFormData({ ...formData, teamorouterModel: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        handleModelChange(e.target.value.trim());
                      }
                    }}
                    placeholder="Ketik model id, misal: gemini-3.8-flash"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-400">
                    Ketik ID model persis seperti di dasbor TeamoRouter lalu klik simpan.
                  </p>
                </div>
              ) : (
                <select
                  value={formData.teamorouterModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {PROVIDERS.map((provider) => {
                    const providerModels = TEAMOROUTER_MODELS.filter((m) => m.provider === provider);
                    return (
                      <optgroup key={provider} label={`━━━ ${provider} (${providerModels.length} models) ━━━`}>
                        {providerModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.pricing ? `[${m.pricing}]` : ''} {m.isRecommended ? '★ Recommended' : ''}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              )}

              {/* Quick Model Selector Pills */}
              <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-slate-400 font-medium">Model Cepat:</span>
                {[
                  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
                  { id: 'gpt-5.4-mini', label: 'GPT-5.4-Mini' },
                  { id: 'deepseek-v4.1-flash', label: 'DeepSeek V4.1' },
                  { id: 'claude-haiku-5.5', label: 'Claude Haiku 5.5' },
                ].map((qm) => {
                  const isActive = formData.teamorouterModel === qm.id;
                  return (
                    <button
                      key={qm.id}
                      type="button"
                      onClick={() => {
                        setUseCustomModel(false);
                        handleModelChange(qm.id);
                      }}
                      className={`px-2 py-0.5 rounded font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {qm.label} {isActive ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Currently Selected Model Badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Model Aktif Tersimpan:{' '}
                  <strong className="font-mono text-emerald-900">{formData.teamorouterModel}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Test Connection Button & Status */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestTeamoRouter}
                  disabled={testingConnection || !formData.teamorouterApiKey.trim()}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                >
                  {testingConnection ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{testingConnection ? 'Menguji Koneksi...' : 'Tes Koneksi TeamoRouter'}</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Tersimpan!' : 'Simpan API Key & Model'}</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                Dilengkapi proxy server internal untuk mencegah kendala browser CORS.
              </span>
            </div>

            {testResult && (
              <div
                className={`text-xs p-3 rounded-lg flex items-start gap-2.5 transition-all ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold">{testResult.message}</div>
                  {testResult.details && (
                    <div className="text-[11px] opacity-80">{testResult.details}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agency Branding Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Identitas Agensi Web Design & Penawaran</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Agensi / Brand</label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="NAFSFlow Studio"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Pengirim / Konsultan</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="Tim Konsultan"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Kota Default</label>
            <input
              type="text"
              value={formData.defaultLocation}
              onChange={(e) => setFormData({ ...formData, defaultLocation: e.target.value })}
              placeholder="Bandung"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Alternative Google Places API Card (Secondary) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 opacity-90">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Google Places API Key (Opsional / Sekunder)
            </h3>
          </div>

          <div className="space-y-1.5">
            <input
              type="password"
              value={formData.googleApiKey}
              onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
              placeholder="AIzaSy... (Opsional jika menggunakan TeamoRouter)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit & Save */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Pengaturan Tersimpan!' : 'Simpan Pengaturan'}</span>
          </button>

          {leadsCount > 0 && (
            <button
              type="button"
              onClick={onClearDatabase}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Database ({leadsCount} leads)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
