import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  AlertTriangle,
  Shield,
  Users,
  Bot,
  X,
  Menu,
  Settings,
  MessageSquare,
  Filter,
  Zap,
  Bell,
} from "lucide-react";

export type TabType =
  | "dashboard"
  | "sites"
  | "warnings"
  | "protection"
  | "roles"
  | "chats"
  | "filters"
  | "settings";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onToggle: () => void;
  unreadNotifications?: number;
  onNotificationClick?: () => void;
}

const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { id: "sites", label: "Site Komutları", icon: <Globe size={18} /> },
  { id: "chats", label: "Chat ID Yönetimi", icon: <MessageSquare size={18} /> },
  { id: "filters", label: "Filtreler", icon: <Filter size={18} /> },
  { id: "warnings", label: "Uyarılar", icon: <AlertTriangle size={18} /> },
  { id: "protection", label: "Koruma Ayarları", icon: <Shield size={18} /> },
  { id: "roles", label: "Yetkili Roller", icon: <Users size={18} /> },
  { id: "settings", label: "Bot Ayarları", icon: <Settings size={18} /> },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  unreadNotifications = 0,
  onNotificationClick,
}: SidebarProps) {
  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl glass border border-[#2A2D3E]/50 text-slate-300 hover:text-white transition-all duration-300 hover:border-[#6C63FF]/30"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 flex flex-col",
          "bg-[#0D0F18]/95 backdrop-blur-xl border-r border-[#1E2035]",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#1E2035]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6C63FF] via-[#5A52E0] to-[#4338CA] flex items-center justify-center shadow-lg shadow-[#6C63FF]/25">
                <Bot size={22} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0D0F18]" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Bot Panel
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                Grup Yönetimi
              </p>
            </div>
            {/* Notification Bell */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-[#6C63FF] text-white text-[8px] font-bold flex items-center justify-center shadow-lg shadow-[#6C63FF]/30">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#6C63FF] animate-ping opacity-20" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
            Ana Menü
          </p>
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (window.innerWidth < 768) onToggle();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                activeTab === item.id
                  ? "bg-[#6C63FF]/12 text-[#8B83FF]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              )}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#6C63FF]" />
              )}
              <span className={cn(
                "transition-colors",
                activeTab === item.id ? "text-[#6C63FF]" : "text-slate-500 group-hover:text-slate-300"
              )}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          <p className="px-3 pt-4 pb-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
            Yönetim
          </p>
          {menuItems.slice(4).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (window.innerWidth < 768) onToggle();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                activeTab === item.id
                  ? "bg-[#6C63FF]/12 text-[#8B83FF]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              )}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#6C63FF]" />
              )}
              <span className={cn(
                "transition-colors",
                activeTab === item.id ? "text-[#6C63FF]" : "text-slate-500 group-hover:text-slate-300"
              )}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Pro Badge */}
        <div className="px-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-[#6C63FF]/10 to-[#4F46E5]/10 border border-[#6C63FF]/15 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={14} className="text-[#6C63FF]" />
              <span className="text-xs font-semibold text-white">Telegram Bot API</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Backend üzerinden güvenli API bağlantısı aktif
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E2035]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 font-medium truncate">Admin</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Çevrimiçi
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}