import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  AlertTriangle,
  VolumeX,
  RotateCcw,
  Volume2,
  Search,
  RefreshCw,
} from "lucide-react";
import type { Warning } from "@/lib/mockData";

const client = createClient();

export default function WarningManagement() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWarnings = async () => {
    setLoading(true);
    try {
      const response = await client.entities.warnings.query({
        query: {},
        sort: "-created_at",
        limit: 100,
      });
      setWarnings(response.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch warnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  const filtered = warnings.filter(
    (w) =>
      w.user_name.toLowerCase().includes(search.toLowerCase()) ||
      w.user_id_tg.toString().includes(search)
  );

  const resetWarning = async (id: number) => {
    try {
      await client.entities.warnings.update({
        id: String(id),
        data: { warning_count: 0, is_muted: false, mute_end: null },
      });
      fetchWarnings();
    } catch (err) {
      console.error("Failed to reset warning:", err);
    }
  };

  const unmute = async (id: number) => {
    try {
      await client.entities.warnings.update({
        id: String(id),
        data: { is_muted: false, mute_end: null },
      });
      fetchWarnings();
    } catch (err) {
      console.error("Failed to unmute:", err);
    }
  };

  const mutedCount = warnings.filter((w) => w.is_muted).length;
  const totalWarnings = warnings.reduce((a, b) => a + b.warning_count, 0);

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Uyarı Yönetimi</h2>
          <p className="text-sm text-slate-400 mt-1">
            Kullanıcı uyarılarını ve mute durumlarını yönetin
          </p>
        </div>
        <button
          onClick={fetchWarnings}
          className="p-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400">Toplam Uyarı</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalWarnings}</p>
        </div>
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4">
          <div className="flex items-center gap-2 mb-2">
            <VolumeX size={16} className="text-red-400" />
            <span className="text-xs text-slate-400">Aktif Mute</span>
          </div>
          <p className="text-2xl font-bold text-white">{mutedCount}</p>
        </div>
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Uyarılı Kullanıcı</span>
          </div>
          <p className="text-2xl font-bold text-white">{warnings.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kullanıcı adı veya ID ile ara..."
          className="w-full bg-[#0F1225]/80 border border-[#1E2035] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
        />
      </div>

      {/* Warnings List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin text-slate-600 mx-auto" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((w) => (
            <div
              key={w.id}
              className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-5 hover:border-[#2A2D3E] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      w.is_muted
                        ? "bg-gradient-to-br from-red-500 to-rose-600"
                        : "bg-gradient-to-br from-slate-600 to-slate-700"
                    }`}
                  >
                    {w.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{w.user_name}</p>
                    <p className="text-xs text-slate-500">ID: {w.user_id_tg}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-0.5">Uyarı</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i <= w.warning_count ? "bg-amber-400" : "bg-[#1E2035]"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-white font-medium ml-1">
                        {w.warning_count}/3
                      </span>
                    </div>
                  </div>

                  {w.is_muted && (
                    <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-medium flex items-center gap-1">
                      <VolumeX size={12} />
                      Susturuldu
                    </span>
                  )}

                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">Son Uyarı</p>
                    <p className="text-xs text-slate-300">{w.last_warning_date}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resetWarning(w.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      title="Uyarıları Sıfırla"
                    >
                      <RotateCcw size={15} />
                    </button>
                    {w.is_muted && (
                      <button
                        onClick={() => unmute(w.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                        title="Mute Kaldır"
                      >
                        <Volume2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 rounded-xl bg-[#0F1225]/80 border border-[#1E2035]">
            <AlertTriangle size={40} className="mx-auto mb-3 opacity-50" />
            <p>Uyarılı kullanıcı bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}