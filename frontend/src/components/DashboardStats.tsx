import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  Users,
  AlertTriangle,
  VolumeX,
  Globe,
  LinkIcon,
  MessageSquare,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Shield,
  Bot,
  Wifi,
  WifiOff,
  Zap,
  RefreshCw,
} from "lucide-react";
import type { DashboardStats as StatsType } from "@/lib/mockData";

const client = createClient();

const statCards = [
  { key: "totalGroups" as const, label: "Toplam Grup", icon: <MessageSquare size={20} />, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/8", border: "border-blue-500/15", text: "text-blue-400" },
  { key: "activeUsers" as const, label: "Aktif Kullanıcı", icon: <Users size={20} />, gradient: "from-emerald-500 to-green-400", bg: "bg-emerald-500/8", border: "border-emerald-500/15", text: "text-emerald-400" },
  { key: "totalWarnings" as const, label: "Toplam Uyarı", icon: <AlertTriangle size={20} />, gradient: "from-amber-500 to-orange-400", bg: "bg-amber-500/8", border: "border-amber-500/15", text: "text-amber-400" },
  { key: "totalMutes" as const, label: "Toplam Mute", icon: <VolumeX size={20} />, gradient: "from-red-500 to-rose-400", bg: "bg-red-500/8", border: "border-red-500/15", text: "text-red-400" },
  { key: "totalCommands" as const, label: "Site Komutları", icon: <Globe size={20} />, gradient: "from-violet-500 to-purple-400", bg: "bg-violet-500/8", border: "border-violet-500/15", text: "text-violet-400" },
  { key: "blockedLinks" as const, label: "Engellenen Link", icon: <LinkIcon size={20} />, gradient: "from-pink-500 to-rose-400", bg: "bg-pink-500/8", border: "border-pink-500/15", text: "text-pink-400" },
];

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString("tr-TR")}</>;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsType>({
    totalGroups: 0,
    activeUsers: 0,
    totalWarnings: 0,
    totalMutes: 0,
    totalCommands: 0,
    blockedLinks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [botConnected, setBotConnected] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [groupsRes, warningsRes, commandsRes, notificationsRes] = await Promise.all([
        client.entities.chat_groups.query({ query: {}, limit: 1000 }),
        client.entities.warnings.query({ query: {}, limit: 1000 }),
        client.entities.site_commands.query({ query: {}, limit: 1000 }),
        client.entities.notifications.query({ query: {}, limit: 1000 }),
      ]);

      const groups = groupsRes.data?.items || [];
      const warnings = warningsRes.data?.items || [];
      const commands = commandsRes.data?.items || [];
      const notifications = notificationsRes.data?.items || [];

      const totalMembers = groups.reduce((sum: number, g: { member_count?: number }) => sum + (g.member_count || 0), 0);
      const mutedCount = warnings.filter((w: { is_muted?: boolean }) => w.is_muted).length;
      const totalWarningCount = warnings.reduce((sum: number, w: { warning_count?: number }) => sum + (w.warning_count || 0), 0);
      const blockedLinks = notifications.filter((n: { type?: string }) => n.type === "blocked_link").length;

      setStats({
        totalGroups: groups.length,
        activeUsers: totalMembers,
        totalWarnings: totalWarningCount,
        totalMutes: mutedCount,
        totalCommands: commands.length,
        blockedLinks: blockedLinks,
      });

      // Check bot status
      try {
        const botRes = await client.apiCall.invoke({
          url: "/api/v1/telegram/status",
          method: "GET",
          data: {},
        });
        setBotConnected(botRes.data?.ok === true);
      } catch {
        setBotConnected(false);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 stagger-children">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2035]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1225] via-[#151933] to-[#0D1020]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/5 via-transparent to-[#4F46E5]/5 animate-gradient" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C63FF]/8 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#4F46E5]/6 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

        <div className="absolute top-1/2 right-32 w-full h-full pointer-events-none hidden lg:block">
          <div className="relative w-0 h-0">
            <div className="absolute w-2 h-2 bg-[#6C63FF]/30 rounded-full animate-orbit" />
            <div className="absolute w-1.5 h-1.5 bg-emerald-400/25 rounded-full animate-orbit" style={{ animationDelay: "-7s", animationDuration: "25s" }} />
            <div className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-orbit" style={{ animationDelay: "-14s", animationDuration: "30s" }} />
          </div>
        </div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4338CA] flex items-center justify-center shadow-xl shadow-[#6C63FF]/20">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Hoş Geldiniz, Admin</h2>
                    <span className="text-2xl">👋</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Telegram Grup Yönetim Paneli v2.0</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-lg leading-relaxed text-sm">
                Telegram bot yönetim panelinize hoş geldiniz. Tüm veriler veritabanından gerçek zamanlı olarak çekilmektedir.
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-medium">
                  <Shield size={12} /> Koruma Aktif
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/15 text-[#8B83FF] text-xs font-medium">
                  <Activity size={12} /> Veritabanı Bağlı
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  botConnected
                    ? "bg-emerald-500/10 border border-emerald-500/15 text-emerald-400"
                    : "bg-slate-500/10 border border-slate-500/15 text-slate-400"
                }`}>
                  {botConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {botConnected ? "Bot Bağlı" : "Bot Bağlı Değil"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Gruplar</span>
                  <TrendingUp size={14} className="text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-white">{stats.totalGroups}</p>
                <p className="text-[10px] text-slate-500">aktif grup yönetiliyor</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Durum</span>
                  <Zap size={14} className="text-[#6C63FF]" />
                </div>
                <p className="text-xl font-bold text-white">Aktif</p>
                <p className="text-[10px] text-slate-500">tüm sistemler çalışıyor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-slate-600" />
          </div>
        ) : (
          statCards.map((card) => (
            <div
              key={card.key}
              className={`group relative overflow-hidden rounded-xl ${card.bg} border ${card.border} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight size={10} /> Canlı
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">
                  <AnimatedCounter value={stats[card.key]} />
                </p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-5 flex items-center gap-4 group hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Shield size={24} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">Gerçek Zamanlı Veri</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tüm veriler veritabanından anlık olarak çekilmektedir. Değişiklikler anında yansır.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-5 flex items-center gap-4 group hover:border-[#6C63FF]/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF]/15 to-[#4F46E5]/15 border border-[#6C63FF]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Users size={24} className="text-[#8B83FF]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">Takım Yönetimi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yetkili kullanıcıları ve rolleri "Yetkili Roller" sekmesinden yönetebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}