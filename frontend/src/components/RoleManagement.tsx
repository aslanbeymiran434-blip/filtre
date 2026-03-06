import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import { Users, Plus, Trash2, Shield, Crown, X, RefreshCw } from "lucide-react";
import type { AuthorizedRole } from "@/lib/mockData";

const client = createClient();

const roleColors: Record<string, string> = {
  "Süper Admin": "from-amber-500 to-yellow-600",
  Moderatör: "from-blue-500 to-blue-600",
  "Yardımcı Admin": "from-emerald-500 to-green-600",
};

const roleBadgeColors: Record<string, string> = {
  "Süper Admin": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Moderatör: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Yardımcı Admin": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

export default function RoleManagement() {
  const [roles, setRoles] = useState<AuthorizedRole[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    userId: "",
    userName: "",
    role: "Moderatör",
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await client.entities.authorized_roles.query({
        query: {},
        sort: "-created_at",
        limit: 100,
      });
      setRoles(response.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const addRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.userName) return;
    try {
      await client.entities.authorized_roles.create({
        data: {
          user_id_tg: parseInt(form.userId),
          user_name: form.userName,
          role: form.role,
          added_date: new Date().toISOString().split("T")[0],
        },
      });
      setForm({ userId: "", userName: "", role: "Moderatör" });
      setModalOpen(false);
      fetchRoles();
    } catch (err) {
      console.error("Failed to add role:", err);
    }
  };

  const removeRole = async (id: number) => {
    try {
      await client.entities.authorized_roles.delete({ id: String(id) });
      fetchRoles();
    } catch (err) {
      console.error("Failed to remove role:", err);
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Yetkili Roller</h2>
          <p className="text-sm text-slate-400 mt-1">
            Bot yönetim yetkisi olan kullanıcıları yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoles}
            className="p-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20"
          >
            <Plus size={16} />
            Yetkili Ekle
          </button>
        </div>
      </div>

      {/* Role Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-slate-600" />
        </div>
      ) : roles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-5 hover:border-[#2A2D3E] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      roleColors[role.role] || "from-slate-500 to-slate-600"
                    } flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {role.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{role.user_name}</p>
                    <p className="text-xs text-slate-500">ID: {role.user_id_tg}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeRole(role.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    roleBadgeColors[role.role] || "bg-slate-500/15 text-slate-400 border-slate-500/20"
                  }`}
                >
                  {role.role === "Süper Admin" ? <Crown size={12} /> : <Shield size={12} />}
                  {role.role}
                </span>
                <span className="text-xs text-slate-500">{role.added_date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 rounded-xl bg-[#0F1225]/80 border border-[#1E2035]">
          <Users size={40} className="mx-auto mb-3 opacity-50" />
          <p>Henüz yetkili kullanıcı eklenmemiş</p>
        </div>
      )}

      {/* Add Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1225] border border-[#1E2035] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#1E2035]">
              <h3 className="text-lg font-semibold text-white">Yetkili Ekle</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={addRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Kullanıcı ID</label>
                <input
                  type="number"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  placeholder="123456789"
                  className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  placeholder="Kullanıcı adı"
                  className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                >
                  <option value="Süper Admin">Süper Admin</option>
                  <option value="Moderatör">Moderatör</option>
                  <option value="Yardımcı Admin">Yardımcı Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium transition-colors shadow-lg shadow-[#6C63FF]/20"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}