// Type definitions only - all data comes from backend

export interface SiteCommand {
  id: number;
  command_name: string;
  site_name: string;
  site_url: string;
  message_text: string;
  button_text: string;
  button_url: string;
  created_at: string;
}

export interface Warning {
  id: number;
  user_id_tg: number;
  user_name: string;
  warning_count: number;
  last_warning_date: string;
  mute_end: string | null;
  is_muted: boolean;
  created_at: string;
}

export interface AuthorizedRole {
  id: number;
  user_id_tg: number;
  user_name: string;
  role: string;
  added_date: string;
  created_at: string;
}

export interface ProtectionSettings {
  id: number;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface ChatGroup {
  id: number;
  chat_id: string;
  chat_name: string;
  is_active: boolean;
  member_count: number;
  added_date: string;
  created_at: string;
}

export interface FilterButton {
  id: number;
  text: string;
  url: string;
}

export interface BotFilter {
  id: number;
  filter_name: string;
  description: string;
  buttons_json: string;
  link: string;
  assigned_chat_ids: string;
  is_active: boolean;
  created_date: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  chat_name: string | null;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalGroups: number;
  activeUsers: number;
  totalWarnings: number;
  totalMutes: number;
  totalCommands: number;
  blockedLinks: number;
}