import { useState, useRef } from "react";
import { X, Upload, Plus, Eye, EyeOff, Loader2 } from "lucide-react";

const CREATE_URL = "http://localhost:3000/api/teachers/create";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  photo: null,
};

export default function AddTeacherDrawer({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.phone) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const body = new FormData();
      body.append("first_name", form.first_name);
      body.append("last_name", form.last_name);
      body.append("email", form.email);
      body.append("password", form.password);
      body.append("phone", form.phone);
      body.append("address", form.address);
      if (form.photo) body.append("photo", form.photo);

      const res = await fetch(CREATE_URL, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Xato: ${res.status}`);
      }

      setForm(INITIAL_FORM);
      setPhotoPreview(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm(INITIAL_FORM);
    setPhotoPreview(null);
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">O'qituvchi qo'shish</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Ism */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Ism <span className="text-red-400">*</span></label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Ismni kiriting"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Familiya */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Familiya <span className="text-red-400">*</span></label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Familiyani kiriting"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
            <input
              name="email"
              type="email"
              autoComplete="new-email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Parol */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Parol <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Parolni kiriting"
                className="w-full px-3 py-2 pr-9 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Telefon <span className="text-red-400">*</span></label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+998901234567"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Manzil */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Manzil</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Shahar, ko'cha"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Surati */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Surati</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
            >
              {photoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={photoPreview} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow" />
                  <span className="text-[10px] text-gray-400">Boshqa rasm tanlash uchun bosing</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <Upload size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-500 font-medium">Rasm yuklash</span>
                    <span className="text-xs text-gray-400"> yoki bu yerga tashlang</span>
                  </div>
                  <span className="text-[10px] text-gray-300">JPG yoki PNG (max 800x800px)</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <><Loader2 size={13} className="animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Plus size={13} /> Saqlash</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}