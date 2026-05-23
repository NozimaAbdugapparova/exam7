import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Loader2, Pencil, Trash2, Archive } from "lucide-react";
import AddRoomDrawer from "./AddRoomDrawer";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  return res.json();
}

export default function Rooms() {
  const [activeTab,  setActiveTab]  = useState("rooms");   // "rooms" | "arxiv"
  const [rooms,      setRooms]      = useState([]);
  const [archived,   setArchived]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRoom,   setEditRoom]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch active rooms ─────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch(`${BASE}/api/rooms/all`);
      if (!json.success) throw new Error("Ma'lumot olishda xatolik");
      setRooms(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch archived rooms ───────────────────────────────────
  const fetchArchived = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch(`${BASE}/api/rooms/all/archived`);
      if (!json.success) throw new Error("Arxiv ma'lumotini olishda xatolik");
      setArchived(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tab o'zgarganda mos API chaqiriladi
  useEffect(() => {
    setSearch("");
    if (activeTab === "rooms") fetchRooms();
    else                       fetchArchived();
  }, [activeTab, fetchRooms, fetchArchived]);

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (room) => {
    if (!window.confirm(`"${room.name}" xonasini o'chirishni tasdiqlaysizmi?`)) return;
    setDeletingId(room.id);
    try {
      const json = await apiFetch(`${BASE}/api/rooms/delete/${room.id}`, { method: "DELETE" });
      if (json.success === false) throw new Error(json.message || "O'chirishda xatolik");
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      // O'chirilgandan keyin arxivni ham yangilash
      fetchArchived();
    } catch (err) {
      alert(err.message || "O'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Edit ───────────────────────────────────────────────────
  const handleEdit = (room) => {
    setEditRoom(room);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditRoom(null);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    setEditRoom(null);
    if (activeTab === "rooms") fetchRooms();
    else                       fetchArchived();
  };

  // ── Filtered list ──────────────────────────────────────────
  const list = activeTab === "rooms" ? rooms : archived;
  const filtered = list.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const refresh = activeTab === "rooms" ? fetchRooms : fetchArchived;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800">Xonalar</h2>
            <button
              onClick={refresh}
              disabled={loading}
              className="text-gray-400 hover:text-[#3d5af1] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Xona nomi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-[#3d5af1] focus:ring-2 focus:ring-[#3d5af1]/10 w-52"
            />
            {activeTab === "rooms" && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-[#3d5af1] hover:bg-[#2a47d6] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Xona qo'shish
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 mb-5">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px
              ${activeTab === "rooms"
                ? "border-[#3d5af1] text-[#3d5af1]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Xonalar
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold
              ${activeTab === "rooms" ? "bg-[#eef1fb] text-[#3d5af1]" : "bg-gray-100 text-gray-500"}`}>
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("arxiv")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px
              ${activeTab === "arxiv"
                ? "border-[#3d5af1] text-[#3d5af1]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Archive size={12} />
            Arxiv
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold
              ${activeTab === "arxiv" ? "bg-[#eef1fb] text-[#3d5af1]" : "bg-gray-100 text-gray-500"}`}>
              {archived.length}
            </span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#3d5af1]" />
            <span className="ml-2 text-sm text-gray-400">Yuklanmoqda...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={refresh} className="text-xs text-[#3d5af1] underline">
              Qayta urinish
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((room) => (
              <div
                key={room.id}
                className={`group relative border rounded-xl p-4 transition-all cursor-pointer
                  ${activeTab === "arxiv"
                    ? "border-gray-100 bg-gray-50/60 hover:shadow-sm"
                    : "border-gray-100 hover:shadow-sm"
                  }`}
              >
                {/* Arxiv badge */}
                {activeTab === "arxiv" && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    <Archive size={9} /> Arxiv
                  </span>
                )}

                <h3 className={`font-semibold mb-2 ${activeTab === "arxiv" ? "text-gray-500 mt-5" : "text-gray-800"}`}>
                  {room.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {room.capacity && <span>Sig'imi: {room.capacity} ta</span>}
                  {room.floor    && <span>{room.floor}-qavat</span>}
                  {room.building && <span>{room.building}</span>}
                </div>

                {/* Hover actions — faqat aktiv xonalarda */}
                {activeTab === "rooms" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(room); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-[#3d5af1] hover:border-[#3d5af1] transition-colors shadow-sm"
                      title="Tahrirlash"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(room); }}
                      disabled={deletingId === room.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm disabled:opacity-50"
                      title="O'chirish"
                    >
                      {deletingId === room.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full text-center py-8">
                {activeTab === "arxiv" ? "Arxivda xonalar yo'q" : "Xonalar topilmadi"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AddRoomDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditRoom(null); }}
        onSuccess={handleDrawerSuccess}
        editRoom={editRoom}
      />
    </>
  );
}