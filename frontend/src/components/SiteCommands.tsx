import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import { Plus, Pencil, Trash2, ExternalLink, X, Globe, RefreshCw } from "lucide-react";
import type { SiteCommand } from "@/lib/mockData";

const client = createClient();

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: Omit<SiteCommand, "id" | "created_at">) => void;
  editData?: SiteCommand | null;
}

function CommandModal({ isOpen, onClose, onSave, editData }: ModalProps) {
  const [form, setForm] = useState({
    command_name: editData?.command_name || "",
    site_name: editData?.site_name || "",
    site_url: editData?.site_url || "",
    message_text: editData?.message_text || "",
    button_text: editData?.button_text || "",
    button_url: editData?.button_url || "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        command_name: editData.command_name,
        site_name: editData.site_name,
        site_url: editData.site_url,
        message_text: editData.message_text || "",
        button_text: editData.button_text || "",
        button_url: editData.button_url || "",
      });
    } else {
      setForm({ command_name: "", site_name: "", site_url: "", message_text: "", button_text: "", button_url: "" });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Omit<SiteCommand, "id" | "created_at">);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1225] border border-[#1E2035] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2035]">
          <h3 className="text-lg font-semibold text-white">
            {editData ? "Komutu Düzenle" : "Yeni Site Komutu"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Komut Adı</label>
            <input
              type="text"
              value={form.command_name}
              onChange={(e) => setForm({ ...form, command_name: e.target.value })}
              placeholder="deepseek"
              className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Site Adı</label>
            <input
              type="text"
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              placeholder="DeepSeek AI"
              className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Site URL</label>
            <input
              type="url"
              value={form.site_url}
              onChange={(e) => setForm({ ...form, site_url: e.target.value })}
              placeholder="https://deepseek.com"
              className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Mesaj Metni</label>
            <input
              type="text"
              value={form.message_text}
              onChange={(e) => setForm({ ...form, message_text: e.target.value })}
              placeholder="🤖 DeepSeek AI - Yapay zeka asistanı"
              className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Buton Metni</label>
              <input
                type="text"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                placeholder="Siteye Git"
                className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Buton URL</label>
              <input
                type="url"
                value={form.button_url}
                onChange={(e) => setForm({ ...form, button_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors text-sm font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20"
            >
              {editData ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SiteCommands() {
  const [commands, setCommands] = useState<SiteCommand[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SiteCommand | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const response = await client.entities.site_commands.query({
        query: {},
        sort: "-created_at",
        limit: 100,
      });
      setCommands(response.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch site commands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleAdd = async (data: Omit<SiteCommand, "id" | "created_at">) => {
    try {
      await client.entities.site_commands.create({ data: data as Record<string, unknown> });
      fetchCommands();
    } catch (err) {
      console.error("Failed to add command:", err);
    }
  };

  const handleEdit = async (data: Omit<SiteCommand, "id" | "created_at">) => {
    if (!editItem) return;
    try {
      await client.entities.site_commands.update({
        id: String(editItem.id),
        data: data as Record<string, unknown>,
      });
      fetchCommands();
      setEditItem(null);
    } catch (err) {
      console.error("Failed to update command:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await client.entities.site_commands.delete({ id: String(id) });
      fetchCommands();
    } catch (err) {
      console.error("Failed to delete command:", err);
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Site Komutları</h2>
          <p className="text-sm text-slate-400 mt-1">
            Gruplarda kullanılacak site komutlarını yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCommands}
            className="p-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => { setEditItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20"
          >
            <Plus size={16} />
            Yeni Komut
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2035]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Komut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Adı</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">URL</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Mesaj</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <RefreshCw size={24} className="animate-spin text-slate-600 mx-auto" />
                  </td>
                </tr>
              ) : (
                commands.map((cmd, index) => (
                  <tr
                    key={cmd.id}
                    className={`border-b border-[#1E2035]/50 hover:bg-white/[0.02] transition-colors ${
                      index % 2 === 0 ? "bg-[#0F1225]/80" : "bg-[#0A0D14]/50"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <code className="text-[#6C63FF] bg-[#6C63FF]/10 px-2.5 py-1 rounded-md text-sm font-mono">
                        !{cmd.command_name}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{cmd.site_name}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <a
                        href={cmd.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-[#6C63FF] flex items-center gap-1 transition-colors"
                      >
                        {cmd.site_url.replace("https://", "").slice(0, 25)}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 hidden lg:table-cell max-w-[200px] truncate">
                      {cmd.message_text}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditItem(cmd); setModalOpen(true); }}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cmd.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && commands.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Globe size={40} className="mx-auto mb-3 opacity-50" />
            <p>Henüz site komutu eklenmemiş</p>
          </div>
        )}
      </div>

      <CommandModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={editItem ? handleEdit : handleAdd}
        editData={editItem}
      />
    </div>
  );
}