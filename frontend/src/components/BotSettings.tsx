import { useState, useEffect } from "react";
import { createClient } from "@metagptx/web-sdk";
import {
  Settings,
  Bot,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Unplug,
} from "lucide-react";

const client = createClient();

export default function BotSettings() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<{
    username: string;
    first_name: string;
    bot_id: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkBotStatus();
  }, []);

  const checkBotStatus = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/telegram/status",
        method: "GET",
        data: {},
      });
      const data = response.data;
      if (data.ok) {
        setBotInfo({
          username: data.username,
          first_name: data.first_name,
          bot_id: data.bot_id,
        });
        setStatus("connected");
      }
    } catch {
      // Not connected
    }
  };

  const connectBot = async () => {
    if (!token.trim()) {
      setStatus("error");
      return;
    }
    setLoading(true);
    setStatus("idle");
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/telegram/connect",
        method: "POST",
        data: { token: token.trim() },
      });
      const data = response.data;
      if (data.ok) {
        setBotInfo({ username: data.username, first_name: data.first_name, bot_id: data.bot_id });
        setStatus("connected");
      } else {
        setStatus("error");
        setBotInfo(null);
      }
    } catch {
      setStatus("error");
      setBotInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnectBot = async () => {
    try {
      await client.apiCall.invoke({ url: "/api/v1/telegram/disconnect", method: "POST", data: {} });
    } catch {
      // ignore
    }
    setToken("");
    setStatus("idle");
    setBotInfo(null);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h2 className="text-xl font-bold text-white">Bot Ayarları</h2>
        <p className="text-sm text-slate-400 mt-1">
          Telegram bot token'ınızı girerek botu backend'e güvenli şekilde bağlayın
        </p>
      </div>

      {/* Connection Status Banner */}
      {status === "connected" && botInfo && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-emerald-400 font-semibold text-sm">Bot Bağlandı!</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="text-white font-medium">@{botInfo.username}</span>{" "}
              ({botInfo.first_name}) - ID: {botInfo.bot_id}
            </p>
          </div>
          <button
            onClick={disconnectBot}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
          >
            <Unplug size={14} />
            Bağlantıyı Kes
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl bg-red-500/8 border border-red-500/15 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/15 flex items-center justify-center text-red-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-red-400 font-semibold text-sm">Bağlantı Başarısız</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Token geçersiz veya bağlantı kurulamadı. Lütfen token'ı kontrol edin.
            </p>
          </div>
        </div>
      )}

      {/* Token Input Card */}
      <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#4338CA] flex items-center justify-center text-white shadow-lg shadow-[#6C63FF]/20">
            <Key size={18} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Bot Token</h3>
            <p className="text-[10px] text-slate-500">
              Token backend'de güvenli şekilde saklanır
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Telegram Bot Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setStatus("idle");
                }}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full bg-[#0A0D14] border border-[#1E2035] rounded-lg px-4 py-3 pr-24 text-white text-sm font-mono placeholder:text-slate-700 focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {token && (
                  <button
                    onClick={copyToken}
                    className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                )}
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              ⚠️ Token backend'de güvenli şekilde saklanır. Frontend'de tutulmaz.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={connectBot}
              disabled={loading || !token.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              {loading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Bot size={15} />
              )}
              {loading ? "Bağlanıyor..." : "Botu Bağla"}
            </button>
            {status === "connected" && (
              <button
                onClick={checkBotStatus}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2035] text-slate-400 hover:text-white hover:border-[#2A2D3E] text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Yenile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How to get token */}
      <div className="rounded-xl bg-[#0F1225]/80 border border-[#1E2035] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Settings size={18} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Token Nasıl Alınır?</h3>
            <p className="text-[10px] text-slate-500">
              Adım adım bot token alma rehberi
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { step: 1, text: "Telegram'da @BotFather botunu açın" },
            { step: 2, text: "/newbot komutunu gönderin veya /mybots ile mevcut botlarınızı görün" },
            { step: 3, text: "Bot adı ve kullanıcı adını belirleyin" },
            { step: 4, text: "BotFather size bir token verecek (örn: 123456789:ABCdef...)" },
            { step: 5, text: 'Token\'ı yukarıdaki alana yapıştırın ve "Botu Bağla" butonuna tıklayın' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}