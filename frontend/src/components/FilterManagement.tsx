import { useState, useEffect, useCallback } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  Plus,
  Trash2,
  X,
  Pencil,
  Filter,
  Link,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";
import type { BotFilter, ChatGroup } from "@/lib/mockData";

const client = createClient();

interface FilterButton {
  id: number;
  text: string;
  url: string;
}

/* ─── Filter Modal ─── */
function FilterModal({
  isOpen,
  onClose,
  onSave,
  editData,
  chats,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { filter_name: string; description: string; link: string; buttons_json: string; assigned_chat_ids: string; is_active: boolean }) => void;
  editData?: BotFilter | null;
  chats: ChatGroup[];
}) {
  const [filterName, setFilterName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [buttons, setButtons] = useState<FilterButton[]>([]);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editData) {
      setFilterName(editData.filter_name || "");
      setDescription(editData.description || "");
      setLink(editData.link || "");
      try { setButtons(JSON.parse(editData.buttons_json || "[]")); } catch { setButtons([]); }
      try { setSelectedChatIds(JSON.parse(editData.assigned_chat_ids || "[]")); } catch { setSelectedChatIds([]); }
      setIsActive(editData.is_active);
    } else {
      setFilterName(""); setDescription(""); setLink(""); setButtons([]); setSelectedChatIds([]); setIsActive(true);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const addButton = () => setButtons([...buttons, { id: Date.now(), text: "", url: "" }]);
  const removeButton = (id: number) => setButtons(buttons.filter((b) => b.id !== id));
  const updateButton = (id: number, field: "text" | "url", value: string) =>
    setButtons(buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  const toggleChat = (chatId: string) =>
    setSelectedChatIds((prev) => prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]);
  const selectAllChats = () => setSelectedChatIds(chats.filter((c) => c.is_active).map((c) => c.chat_id));
  const deselectAllChats = () => setSelectedChatIds([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      filter_name: filterName.trim(),
      description: description.trim(),
      link: link.trim(),
      buttons_json: JSON.stringify(buttons.filter((b) => b.text.trim() !== "")),
      assigned_chat_ids: JSON.stringify(selectedChatIds),
      is_active: isActive,
    });
    onClose();
  };

  const activeChats = chats.filter((c) => c.is_active);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1225] border border-[#1E2035] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2035] sticky top-0 bg-[#0F1225] z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-white">{editData ? "Filtreyi Düzenle" : "Yeni Filtre Ekle"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Filtre Adı <span className="text-red-400">*</span></label>
            <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Örn: hoşgeldin, kurallar" className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors" required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Açıklama / Mesaj Metni</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Filtre tetiklendiğinde gönderilecek mesaj..." rows={4} className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Link (Opsiyonel)</label>
            <div className="relative">
              <Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors" />
            </div>
          </div>

          {/* Inline Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-slate-400 font-medium">Inline Butonlar</label>
              <button type="button" onClick={addButton} className="flex items-center gap-1.5 text-xs text-[#6C63FF] hover:text-[#8B83FF] font-medium transition-colors"><Plus size={14} /> Buton Ekle</button>
            </div>
            {buttons.length === 0 ? (
              <div className="rounded-lg bg-[#0A0D14] border border-[#1E2035] border-dashed p-6 text-center">
                <MousePointerClick size={22} className="mx-auto mb-2 text-slate-700" />
                <p className="text-[10px] text-slate-600">Henüz buton eklenmemiş.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {buttons.map((btn, index) => (
                  <div key={btn.id} className="rounded-lg bg-[#0A0D14] border border-[#1E2035] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-600 font-medium">Buton {index + 1}</span>
                      <button type="button" onClick={() => removeButton(btn.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={btn.text} onChange={(e) => updateButton(btn.id, "text", e.target.value)} placeholder="Buton metni" className="bg-[#0F1225] border border-[#1E2035] rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors" />
                      <input type="url" value={btn.url} onChange={(e) => updateButton(btn.id, "url", e.target.value)} placeholder="https://..." className="bg-[#0F1225] border border-[#1E2035] rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat ID Assignment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-slate-400 font-medium">Yetkili Chat ID'ler</label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAllChats} className="text-[10px] text-[#6C63FF] hover:text-[#8B83FF] font-medium">Tümünü Seç</button>
                <span className="text-slate-700">|</span>
                <button type="button" onClick={deselectAllChats} className="text-[10px] text-slate-500 hover:text-slate-300 font-medium">Temizle</button>
              </div>
            </div>
            {activeChats.length === 0 ? (
              <div className="rounded-lg bg-[#0A0D14] border border-[#1E2035] border-dashed p-6 text-center">
                <p className="text-[10px] text-slate-600">Aktif chat ID bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeChats.map((chat) => (
                  <label key={chat.id} className="flex items-center gap-3 rounded-lg bg-[#0A0D14] border border-[#1E2035] p-3 cursor-pointer hover:border-[#2A2D3E] transition-colors">
                    <input type="checkbox" checked={selectedChatIds.includes(chat.chat_id)} onChange={() => toggleChat(chat.chat_id)} className="w-4 h-4 rounded border-[#1E2035] bg-[#0A0D14] text-[#6C63FF] focus:ring-[#6C63FF] focus:ring-offset-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white font-medium">{chat.chat_name}</span>
                      <span className="text-[10px] text-slate-600 ml-2 font-mono">{chat.chat_id}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg bg-[#0A0D14] border border-[#1E2035] p-4">
            <div>
              <p className="text-sm text-white font-medium">Filtre Durumu</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Filtreyi aktif veya pasif yapın</p>
            </div>
            <button type="button" onClick={() => setIsActive(!isActive)} className="flex items-center gap-2">
              {isActive ? (<><ToggleRight size={26} className="text-emerald-400" /><span className="text-xs text-emerald-400 font-medium">Aktif</span></>) : (<><ToggleLeft size={26} className="text-slate-600" /><span className="text-xs text-slate-600 font-medium">Pasif</span></>)}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors text-sm font-medium">İptal</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20">{editData ? "Güncelle" : "Ekle"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Filter Card ─── */
function FilterCard({ filter, chats, onEdit, onDelete, onToggle }: { filter: BotFilter; chats: ChatGroup[]; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false);

  let parsedButtons: FilterButton[] = [];
  let parsedChatIds: string[] = [];
  try { parsedButtons = JSON.parse(filter.buttons_json || "[]"); } catch { /* empty */ }
  try { parsedChatIds = JSON.parse(filter.assigned_chat_ids || "[]"); } catch { /* empty */ }

  const assignedChatNames = parsedChatIds.map((id) => {
    const chat = chats.find((c) => c.chat_id === id);
    return chat?.chat_name || id;
  });

  return (
    <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] overflow-hidden hover:border-[#2A2D3E] transition-all duration-200">
      <div className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${filter.is_active ? "bg-gradient-to-br from-[#6C63FF] to-[#4338CA] shadow-[#6C63FF]/20" : "bg-gradient-to-br from-slate-600 to-slate-700"}`}>
          <Filter size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold text-sm truncate">{filter.filter_name}</h4>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${filter.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>
              {filter.is_active ? "Aktif" : "Pasif"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{filter.description || "Açıklama yok"}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-600">{parsedButtons.length} buton</span>
            <span className="text-[10px] text-slate-700">•</span>
            <span className="text-[10px] text-slate-600">{parsedChatIds.length} grup</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onToggle} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors">
            {filter.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-500 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"><Pencil size={14} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#1E2035] p-5 space-y-4 bg-[#0A0D14]/50">
          {filter.description && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5 font-semibold">Açıklama</p>
              <p className="text-xs text-slate-400 whitespace-pre-wrap">{filter.description}</p>
            </div>
          )}
          {parsedButtons.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Inline Butonlar</p>
              <div className="flex flex-wrap gap-2">
                {parsedButtons.map((btn) => (
                  <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C63FF]/10 text-[#8B83FF] text-xs font-medium hover:bg-[#6C63FF]/20 transition-colors">
                    <MousePointerClick size={11} />{btn.text}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Yetkili Gruplar</p>
            {assignedChatNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedChatNames.map((name, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/8 text-emerald-400 text-xs font-medium">{name}</span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-600">Hiçbir gruba atanmamış</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
interface FilterManagementProps {
  filters: BotFilter[];
  onFiltersChange: (filters: BotFilter[]) => void;
  chats: ChatGroup[];
}

export default function FilterManagement({ filters, onFiltersChange, chats }: FilterManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BotFilter | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await client.entities.bot_filters.query({
        query: {},
        sort: "-created_at",
        limit: 100,
      });
      onFiltersChange(response.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    } finally {
      setLoading(false);
    }
  }, [onFiltersChange]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleAdd = async (data: { filter_name: string; description: string; link: string; buttons_json: string; assigned_chat_ids: string; is_active: boolean }) => {
    try {
      await client.entities.bot_filters.create({
        data: { ...data, created_date: new Date().toISOString().split("T")[0] },
      });
      fetchFilters();
    } catch (err) {
      console.error("Failed to add filter:", err);
    }
  };

  const handleEdit = async (data: { filter_name: string; description: string; link: string; buttons_json: string; assigned_chat_ids: string; is_active: boolean }) => {
    if (!editItem) return;
    try {
      await client.entities.bot_filters.update({ id: String(editItem.id), data });
      fetchFilters();
      setEditItem(null);
    } catch (err) {
      console.error("Failed to update filter:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await client.entities.bot_filters.delete({ id: String(id) });
      fetchFilters();
    } catch (err) {
      console.error("Failed to delete filter:", err);
    }
  };

  const handleToggle = async (filter: BotFilter) => {
    try {
      await client.entities.bot_filters.update({
        id: String(filter.id),
        data: { is_active: !filter.is_active },
      });
      fetchFilters();
    } catch (err) {
      console.error("Failed to toggle filter:", err);
    }
  };

  const filtered = filters.filter(
    (f) =>
      f.filter_name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Filtreler</h2>
          <p className="text-sm text-slate-400 mt-1">Gruplarda kullanılacak filtreleri yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFilters} className="p-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20">
            <Plus size={16} /> Yeni Filtre
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtre adı veya açıklama ara..." className="w-full bg-[#0F1225]/80 border border-[#1E2035] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors" />
      </div>

      {filters.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 text-center">
            <p className="text-2xl font-bold text-white">{filters.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Toplam Filtre</p>
          </div>
          <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{filters.filter((f) => f.is_active).length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Aktif</p>
          </div>
          <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-4 text-center">
            <p className="text-2xl font-bold text-[#8B83FF]">
              {filters.reduce((sum, f) => { try { return sum + JSON.parse(f.buttons_json || "[]").length; } catch { return sum; } }, 0)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Toplam Buton</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-slate-600" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((filter) => (
            <FilterCard
              key={filter.id}
              filter={filter}
              chats={chats}
              onEdit={() => { setEditItem(filter); setModalOpen(true); }}
              onDelete={() => handleDelete(filter.id)}
              onToggle={() => handleToggle(filter)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-12 text-center">
          <Filter size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500 text-sm">
            {search ? "Aramanızla eşleşen filtre bulunamadı" : "Henüz filtre eklenmemiş."}
          </p>
        </div>
      )}

      <FilterModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={editItem ? handleEdit : handleAdd}
        editData={editItem}
        chats={chats}
      />
    </div>
  );
}