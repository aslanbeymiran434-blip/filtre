import { useState, useEffect, useCallback } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  X,
  Bell,
  AlertTriangle,
  LinkIcon,
  Filter,
  Bot,
  Info,
  CheckCheck,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react";
import type { Notification } from "@/lib/mockData";

const client = createClient();

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  warning: {
    icon: <AlertTriangle size={16} />,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/15",
  },
  blocked_link: {
    icon: <LinkIcon size={16} />,
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/15",
  },
  filter_trigger: {
    icon: <Filter size={16} />,
    color: "text-[#8B83FF]",
    bg: "bg-[#6C63FF]/8",
    border: "border-[#6C63FF]/15",
  },
  bot_status: {
    icon: <Bot size={16} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
  },
  system: {
    icon: <Info size={16} />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/8",
    border: "border-cyan-500/15",
  },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  return `${diffDay} gün önce`;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await client.entities.notifications.query({
        query: {},
        sort: "-created_at",
        limit: 50,
      });
      const items = response.data?.items || [];
      setNotifications(items);
      const unread = items.filter((n: Notification) => !n.is_read).length;
      onUnreadCountChange(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await client.entities.notifications.update({
        id: String(id),
        data: { is_read: true },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    try {
      await Promise.all(
        unreadIds.map((id) =>
          client.entities.notifications.update({
            id: String(id),
            data: { is_read: true },
          })
        )
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      onUnreadCountChange(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await client.entities.notifications.delete({ id: String(id) });
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.is_read) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : activeFilter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === activeFilter);

  const filterTabs = [
    { key: "all", label: "Tümü" },
    { key: "unread", label: "Okunmamış" },
    { key: "warning", label: "Uyarılar" },
    { key: "blocked_link", label: "Linkler" },
    { key: "filter_trigger", label: "Filtreler" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-[#0D0F18]/98 backdrop-blur-xl border-l border-[#1E2035] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#1E2035] flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#4338CA] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
                  <Bell size={17} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Bildirimler</h3>
                  <p className="text-[10px] text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} okunmamış bildirim`
                      : "Tüm bildirimler okundu"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchNotifications}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Yenile"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                    title="Tümünü Okundu İşaretle"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeFilter === tab.key
                      ? "bg-[#6C63FF]/15 text-[#8B83FF]"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                  }`}
                >
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#8B83FF] text-[9px]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={20} className="animate-spin text-slate-600" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell size={36} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-600">
                  {activeFilter === "unread"
                    ? "Okunmamış bildirim yok"
                    : "Bildirim bulunamadı"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.system;
                return (
                  <div
                    key={notification.id}
                    className={`group rounded-xl p-3.5 border transition-all duration-200 cursor-pointer ${
                      notification.is_read
                        ? "bg-[#0A0D14]/50 border-[#1E2035]/50 opacity-70 hover:opacity-100"
                        : `${config.bg} ${config.border}`
                    }`}
                    onClick={() => {
                      if (!notification.is_read) markAsRead(notification.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          notification.is_read
                            ? "bg-slate-800 text-slate-500"
                            : `${config.bg} ${config.color}`
                        }`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4
                            className={`text-xs font-semibold truncate ${
                              notification.is_read ? "text-slate-400" : "text-white"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed ${
                            notification.is_read ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {notification.chat_name && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500 font-medium">
                              {notification.chat_name}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-600 flex items-center gap-1">
                            <Clock size={9} />
                            {getTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1E2035] flex-shrink-0">
            <p className="text-[10px] text-slate-600 text-center">
              Bildirimler her 30 saniyede otomatik güncellenir
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Notification Bell Button ─── */
export function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group"
    >
      <Bell size={18} className="group-hover:scale-110 transition-transform" />
      {unreadCount > 0 && (
        <>
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-[#6C63FF]/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#6C63FF] animate-ping opacity-30" />
        </>
      )}
    </button>
  );
}