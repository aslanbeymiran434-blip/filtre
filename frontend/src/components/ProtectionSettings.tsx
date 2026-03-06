import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  Shield,
  Link2,
  AlertTriangle,
  Clock,
  X,
  Plus,
  Ban,
  Save,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import type { ProtectionSettings as SettingsRow } from "@/lib/mockData";

const client = createClient();

interface ParsedSettings {
  linkProtection: boolean;
  warningLimit: number;
  muteDuration: number;
  bannedWords: string[];
}

export default function ProtectionSettings() {
  const [settings, setSettings] = useState<ParsedSettings>({
    linkProtection: true,
    warningLimit: 3,
    muteDuration: 60,
    bannedWords: [],
  });
  const [rawRows, setRawRows] = useState<SettingsRow[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await client.entities.protection_settings.query({
        query: {},
        limit: 100,
      });
      const items: SettingsRow[] = response.data?.items || [];
      setRawRows(items);

      const parsed: ParsedSettings = {
        linkProtection: true,
        warningLimit: 3,
        muteDuration: 60,
        bannedWords: [],
      };

      items.forEach((item) => {
        switch (item.setting_key) {
          case "link_protection":
            parsed.linkProtection = item.setting_value === "true";
            break;
          case "warning_limit":
            parsed.warningLimit = parseInt(item.setting_value) || 3;
            break;
          case "mute_duration":
            parsed.muteDuration = parseInt(item.setting_value) || 60;
            break;
          case "banned_words":
            try {
              parsed.bannedWords = JSON.parse(item.setting_value);
            } catch {
              parsed.bannedWords = [];
            }
            break;
        }
      });

      setSettings(parsed);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const existing = rawRows.find((r) => r.setting_key === key);
    try {
      if (existing) {
        await client.entities.protection_settings.update({
          id: String(existing.id),
          data: { setting_value: value },
        });
      } else {
        await client.entities.protection_settings.create({
          data: { setting_key: key, setting_value: value },
        });
      }
    } catch (err) {
      console.error("Failed to save setting:", err);
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      await saveSetting("link_protection", String(settings.linkProtection));
      await saveSetting("warning_limit", String(settings.warningLimit));
      await saveSetting("mute_duration", String(settings.muteDuration));
      await saveSetting("banned_words", JSON.stringify(settings.bannedWords));
      await fetchSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const addBannedWord = () => {
    if (newWord.trim() && !settings.bannedWords.includes(newWord.trim())) {
      setSettings({
        ...settings,
        bannedWords: [...settings.bannedWords, newWord.trim()],
      });
      setNewWord("");
    }
  };

  const removeBannedWord = (word: string) => {
    setSettings({
      ...settings,
      bannedWords: settings.bannedWords.filter((w) => w !== word),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Koruma Ayarları</h2>
          <p className="text-sm text-slate-400 mt-1">
            Grup koruma ve moderasyon ayarlarını yapılandırın
          </p>
        </div>
        <button
          onClick={saveAllSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-600/20"
        >
          {saved ? (
            <><CheckCircle size={15} /> Kaydedildi!</>
          ) : saving ? (
            <><RefreshCw size={15} className="animate-spin" /> Kaydediliyor...</>
          ) : (
            <><Save size={15} /> Kaydet</>
          )}
        </button>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Link Protection */}
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Link2 size={18} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Link Koruma</h3>
                <p className="text-[10px] text-slate-500">Yetkisiz link paylaşımını engelle</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, linkProtection: !settings.linkProtection })}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                settings.linkProtection ? "bg-[#6C63FF]" : "bg-[#1E2035]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  settings.linkProtection ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {settings.linkProtection
              ? "✅ Link koruma aktif - Yetkisiz kullanıcıların linkleri silinecek"
              : "❌ Link koruma kapalı - Herkes link paylaşabilir"}
          </p>
        </div>

        {/* Warning Limit */}
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Uyarı Sınırı</h3>
              <p className="text-[10px] text-slate-500">Mute için gereken uyarı sayısı</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings({ ...settings, warningLimit: Math.max(1, settings.warningLimit - 1) })}
              className="w-10 h-10 rounded-lg bg-[#0A0D14] border border-[#1E2035] text-white hover:border-[#6C63FF]/50 transition-colors flex items-center justify-center text-lg font-bold"
            >
              -
            </button>
            <span className="text-2xl font-bold text-white w-12 text-center">{settings.warningLimit}</span>
            <button
              onClick={() => setSettings({ ...settings, warningLimit: Math.min(10, settings.warningLimit + 1) })}
              className="w-10 h-10 rounded-lg bg-[#0A0D14] border border-[#1E2035] text-white hover:border-[#6C63FF]/50 transition-colors flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
            <span className="text-sm text-slate-400 ml-2">uyarı</span>
          </div>
        </div>

        {/* Mute Duration */}
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Mute Süresi</h3>
              <p className="text-[10px] text-slate-500">Susturma süresi (dakika)</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[15, 30, 60, 120, 360, 1440].map((min) => (
              <button
                key={min}
                onClick={() => setSettings({ ...settings, muteDuration: min })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.muteDuration === min
                    ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"
                    : "bg-[#0A0D14] border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E]"
                }`}
              >
                {min < 60 ? `${min} dk` : min < 1440 ? `${min / 60} saat` : "1 gün"}
              </button>
            ))}
          </div>
        </div>

        {/* Shield Info Card */}
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6 flex flex-col items-center justify-center">
          <Shield size={48} className="text-[#6C63FF]/30 mb-4" />
          <p className="text-sm text-slate-400 text-center">
            Ayarları değiştirdikten sonra "Kaydet" butonuna tıklayarak veritabanına kaydedin
          </p>
        </div>
      </div>

      {/* Banned Words */}
      <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Ban size={18} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Yasaklı Kelimeler</h3>
            <p className="text-[10px] text-slate-500">Bu kelimeleri içeren mesajlar otomatik silinir</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBannedWord()}
            placeholder="Yasaklanacak kelimeyi yazın..."
            className="flex-1 bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
          />
          <button
            onClick={addBannedWord}
            className="px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#6C63FF]/20"
          >
            <Plus size={16} />
            Ekle
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.bannedWords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {word}
              <button onClick={() => removeBannedWord(word)} className="hover:text-red-300 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
          {settings.bannedWords.length === 0 && (
            <p className="text-sm text-slate-500">Henüz yasaklı kelime eklenmemiş</p>
          )}
        </div>
      </div>
    </div>
  );
}