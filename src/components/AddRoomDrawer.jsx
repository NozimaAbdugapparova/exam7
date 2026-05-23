import { useState, useEffect } from "react";
import { X } from "lucide-react";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function AddRoomDrawer({ open, onClose, onSuccess, editRoom = null }) {
  const [name,     setName]     = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const isEdit = !!editRoom;

  // Edit modeda mavjud ma'lumotlarni to'ldirish
  useEffect(() => {
    if (editRoom) {
      setName(editRoom.name || "");
      setCapacity(String(editRoom.capacity || ""));
    } else {
      setName(""); setCapacity("");
    }
    setError("");
  }, [editRoom, open]);

  const handleSave = async () => {
    setError("");
    if (!name.trim())          { setError("Xona nomini kiriting");               return; }
    if (!capacity)             { setError("Sig'imni kiriting");                  return; }
    if (Number(capacity) <= 0) { setError("Sig'im 0 dan katta bo'lishi kerak"); return; }

    setLoading(true);
    try {
      const token = getToken();

      const url    = isEdit
        ? `${BASE}/api/rooms/update/room/${editRoom.id}`
        : `${BASE}/api/rooms/add/new`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name:     name.trim(),
          capacity: Number(capacity),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || "Tizimda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(""); setCapacity(""); setError("");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-[420px] max-w-full bg-white z-50
        flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {isEdit ? "Xonani tahrirlash" : "Xona qo'shish"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Xona ma'lumotlarini yangilang" : "Yangi xona ma'lumotlarini kiriting"}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Xona nomi</label>
            <input
              type="text"
              placeholder="Masalan: Facebook, Room 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:border-[#3d5af1] focus:bg-white focus:ring-2 focus:ring-[#3d5af1]/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Sig'imi (talabalar soni)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Masalan: 20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:border-[#3d5af1] focus:bg-white focus:ring-2 focus:ring-[#3d5af1]/10"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3d5af1] hover:bg-[#2a47d6] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            )}
            {isEdit ? "Yangilash" : "Saqlash"}
          </button>
        </div>
      </div>
    </>
  );
}