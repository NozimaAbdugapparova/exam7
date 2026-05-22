import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import AddRoomDrawer from "./AddRoomDrawer";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function Rooms() {
  const [rooms,      setRooms]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/rooms/all`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const json = await res.json();
      if (!json.success) throw new Error("Ma'lumot olishda xatolik");
      setRooms(json.data ?? []);
    } catch (err) {
      setError(err.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800">Xonalar</h2>
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="text-gray-400 hover:text-[#3d5af1] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Xona nomi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-[#3d5af1] focus:ring-2 focus:ring-[#3d5af1]/10 w-52"
            />

            {/* Add button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 bg-[#3d5af1] hover:bg-[#2a47d6] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Xona qo'shish
            </button>
          </div>
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
            <button onClick={fetchRooms} className="text-xs text-[#3d5af1] underline">
              Qayta urinish
            </button>
          </div>
        )}

        {/* Room Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-800 mb-3">{room.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {room.capacity && (
                    <span>Sig'imi: {room.capacity} ta talaba</span>
                  )}
                  {room.floor    && <span>{room.floor}-qavat</span>}
                  {room.building && <span>{room.building}</span>}
                </div>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full text-center py-8">
                Xonalar topilmadi
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AddRoomDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          setDrawerOpen(false);
          fetchRooms();
        }}
      />
    </>
  );
}