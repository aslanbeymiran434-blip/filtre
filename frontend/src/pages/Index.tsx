import { useState } from "react";
import Sidebar, { type TabType } from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import SiteCommands from "@/components/SiteCommands";
import WarningManagement from "@/components/WarningManagement";
import ProtectionSettings from "@/components/ProtectionSettings";
import RoleManagement from "@/components/RoleManagement";
import BotSettings from "@/components/BotSettings";
import ChatManagement from "@/components/ChatManagement";
import FilterManagement from "@/components/FilterManagement";
import NotificationDrawer, { NotificationBell } from "@/components/NotificationDrawer";
import type { ChatGroup, BotFilter } from "@/lib/mockData";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [filters, setFilters] = useState<BotFilter[]>([]);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
      case "sites":
        return <SiteCommands />;
      case "chats":
        return <ChatManagement chats={chats} onChatsChange={setChats} />;
      case "filters":
        return (
          <FilterManagement
            filters={filters}
            onFiltersChange={setFilters}
            chats={chats}
          />
        );
      case "warnings":
        return <WarningManagement />;
      case "protection":
        return <ProtectionSettings />;
      case "roles":
        return <RoleManagement />;
      case "settings":
        return <BotSettings />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6C63FF]/8 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4F46E5]/6 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(108, 99, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108, 99, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-20 left-1/3 w-1 h-1 bg-[#6C63FF]/40 rounded-full animate-float" />
        <div className="absolute top-40 right-1/4 w-1.5 h-1.5 bg-emerald-400/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-40 left-1/2 w-1 h-1 bg-amber-400/30 rounded-full animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-[#6C63FF]/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-60 left-1/4 w-1.5 h-1.5 bg-pink-400/20 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        unreadNotifications={unreadCount}
        onNotificationClick={() => setNotificationDrawerOpen(true)}
      />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen relative z-10">
        {/* Top Bar with Notification Bell (mobile + desktop) */}
        <div className="sticky top-0 z-20 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-[#1E2035]/50">
          <div className="flex items-center justify-end px-6 py-3 max-w-6xl">
            <NotificationBell
              unreadCount={unreadCount}
              onClick={() => setNotificationDrawerOpen(true)}
            />
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-6xl">{renderContent()}</div>
      </main>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}