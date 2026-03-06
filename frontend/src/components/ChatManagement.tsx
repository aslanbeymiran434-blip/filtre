import { useState, useEffect, useCallback } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  Plus,
  Trash2,
  X,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Search,
  Hash,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import type { ChatGroup } from "@/lib/mockData";

const client = createClient();

interface ChatManagementProps {
  chats: ChatGroup[];
  onChatsChange: (chats: ChatGroup[]) => void;
}

/* ─── Add Chat Modal ─── */
function AddChatModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { chat_id: string; chat_name: string; is_active: boolean; member_count: number }) => void;
}) {
  const [chatId, setChatId] = useState("");
  const [chatName, setChatName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [memberCount, setMemberCount] = useState(0);

  if (!isOpen) return null;

  const verifyChatId = async () => {
    if (!chatId.trim()) return;
    setVerifying(true);
    setVerified(false);
    setVerifyError("");
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/telegram/verify-chat",
        method: "POST",
        data: { chat_id: chatId.trim() },
      });
      const data = response.data;
      if (data.ok) {
        setChatName(data.title || "");
        setMemberCount(data.member_count || 0);
        setVerified(true);
      } else {
        setVerifyError(data.error || "Doğrulama başarısız");
      }
    } catch {
      setVerifyError("Bot bağlı değil veya API hatası");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      chat_id: chatId.trim(),
      chat_name: chatName.trim(),
      is_active: true,
      member_count: memberCount,
    });
    setChatId("");
    setChatName("");
    setVerified(false);
    setVerifyError("");
    setMemberCount(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1225] border border-[#1E2035] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2035]">
          <h3 className="text-lg font-semibold text-white">Yeni Chat ID Ekle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Chat ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatId}
                onChange={(e) => { setChatId(e.target.value); setVerified(false); setVerifyError(""); }}
                placeholder="-1001234567890"
                className="flex-1 bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                required
              />
              <button
                type="button"
                onClick={verifyChatId}
                disabled={verifying || !chatId.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-medium transition-colors"
              >
                {verifying ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Doğrula
              </button>
            </div>
            {verified && (
              <div className="mt-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15 p-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-emerald-400 font-medium">Doğrulandı!</p>
                  <p className="text-[10px] text-slate-400">{chatName} • {memberCount} üye</p>
                </div>
              </div>
            )}
            {verifyError && (
              <div className="mt-2 rounded-lg bg-red-500/8 border border-red-500/15 p-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{verifyError}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Grup Adı</label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Örn: Ana Grup, Test Grubu"
              className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors text-sm font-medium">
              İptal
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Send Message Modal ─── */
function SendMessageModal({ isOpen, onClose, chatId, chatName }: { isOpen: boolean; onClose: () => void; chatId: string; chatName: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await client.apiCall.invoke({
        url: "/api/v1/telegram/send-message",
        method: "POST",
        data: { chat_id: chatId, text: message, parse_mode: "HTML" },
      });
      setSent(true);
      setTimeout(() => { setSent(false); setMessage(""); onClose(); }, 1500);
    } catch {
      alert("Mesaj gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1225] border border-[#1E2035] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2035]">
          <div>
            <h3 className="text-lg font-semibold text-white">Mesaj Gönder</h3>
            <p className="text-xs text-slate-500 mt-0.5">{chatName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Gruba gönderilecek mesajı yazın... (HTML desteklenir)"
            rows={5}
            className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors resize-none"
          />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2035] text-slate-400 hover:text-white text-sm font-medium transition-colors">İptal</button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {sent ? (<><CheckCircle size={15} /> Gönderildi!</>) : sending ? (<><RefreshCw size={15} className="animate-spin" /> Gönderiliyor...</>) : (<><Send size={15} /> Gönder</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatManagement({ chats, onChatsChange }: ChatManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sendModal, setSendModal] = useState<{ chatId: string; chatName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await client.entities.chat_groups.query({
        query: {},
        sort: "-created_at",
        limit: 100,
      });
      onChatsChange(response.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  }, [onChatsChange]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleAdd = async (data: { chat_id: string; chat_name: string; is_active: boolean; member_count: number }) => {
    try {
      await client.entities.chat_groups.create({
        data: {
          ...data,
          added_date: new Date().toISOString().split("T")[0],
        },
      });
      fetchChats();
    } catch (err) {
      console.error("Failed to add chat:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await client.entities.chat_groups.delete({ id: String(id) });
      fetchChats();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleToggle = async (chat: ChatGroup) => {
    try {
      await client.entities.chat_groups.update({
        id: String(chat.id),
        data: { is_active: !chat.is_active },
      });
      fetchChats();
    } catch (err) {
      console.error("Failed to toggle chat:", err);
    }
  };

  const filtered = chats.filter(
    (c) =>
      c.chat_name.toLowerCase().includes(search.toLowerCase()) ||
      c.chat_id.includes(search)
  );

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Chat ID Yönetimi</h2>
          <p className="text-sm text-slate-400 mt-1">Bot'un çalışacağı grupların chat ID'lerini yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchChats} className="p-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20"
          >
            <Plus size={16} />
            Chat ID Ekle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chat ID veya grup adı ara..."
          className="w-full bg-[#0F1225]/80 border border-[#1E2035] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
        />
      </div>

      {/* Info Card */}
      <div className="rounded-xl bg-[#6C63FF]/5 border border-[#6C63FF]/10 p-4">
        <div className="flex items-start gap-3">
          <Hash size={16} className="text-[#6C63FF] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400">
            <strong className="text-white">Chat ID nasıl bulunur?</strong> Bot'u gruba ekleyin,
            ardından "Doğrula" butonuyla Telegram API üzerinden otomatik olarak grup bilgisini çekin.
          </p>
        </div>
      </div>

      {/* Chat List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-slate-600" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((chat) => (
            <div
              key={chat.id}
              className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 flex items-center gap-4 hover:border-[#2A2D3E] transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
                chat.is_active
                  ? "bg-gradient-to-br from-[#6C63FF] to-[#4338CA] shadow-[#6C63FF]/20"
                  : "bg-gradient-to-br from-slate-600 to-slate-700"
              }`}>
                <MessageSquare size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm truncate">{chat.chat_name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{chat.chat_id}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {chat.member_count > 0 && `${chat.member_count} üye • `}Eklenme: {chat.added_date}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSendModal({ chatId: chat.chat_id, chatName: chat.chat_name })}
                  className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Mesaj Gönder"
                >
                  <Send size={14} />
                </button>
                <button onClick={() => handleToggle(chat)} className="flex items-center gap-1.5">
                  {chat.is_active ? (
                    <><ToggleRight size={24} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-medium hidden sm:inline">Aktif</span></>
                  ) : (
                    <><ToggleLeft size={24} className="text-slate-600" /><span className="text-[10px] text-slate-600 font-medium hidden sm:inline">Pasif</span></>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(chat.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-12 text-center">
          <MessageSquare size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500 text-sm">
            {search ? "Aramanızla eşleşen chat bulunamadı" : "Henüz chat ID eklenmemiş. Yukarıdaki butona tıklayarak ekleyin."}
          </p>
        </div>
      )}

      {/* Stats */}
      {chats.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 text-center">
            <p className="text-2xl font-bold text-white">{chats.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Toplam Grup</p>
          </div>
          <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{chats.filter((c) => c.is_active).length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Aktif Grup</p>
          </div>
        </div>
      )}

      <AddChatModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
      {sendModal && (
        <SendMessageModal isOpen={true} onClose={() => setSendModal(null)} chatId={sendModal.chatId} chatName={sendModal.chatName} />
      )}
    </div>
  );
}