import { useState, useRef, useEffect } from "react";
import { X, Plus, Loader2, Upload, Eye, EyeOff, Save } from "lucide-react";

const CREATE_URL = "http://localhost:3000/api/students/student/add";
const UPDATE_URL = "http://localhost:3000/api/students/update";
const PHOTO_BASE = "http://localhost:3000/uploads/";

const INITIAL = {
  first_name: "", last_name: "", email: "",
  password: "", phone: "", address: "",
  birth_date: "", photo: null,
};

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white
        placeholder-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
    />
  );
}

/* ── PROPS:
   open       — drawer ochiq/yopiq
   onClose    — yopish
   onSuccess  — muvaffaqiyatdan keyin
   student    — tahrirlash uchun student obyekti (bo'lmasa — create rejimi)
── */
export default function AddStudentDrawer({ open, onClose, onSuccess, student }) {
  const isEdit = !!student;

  const [form, setForm]            = useState(INITIAL);
  const [photoPreview, setPreview] = useState(null);
  const [showPass, setShowPass]    = useState(false);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState(null);
  const fileRef                    = useRef();

  // Edit rejimida form ni to'ldirish
  useEffect(() => {
    if (open && isEdit) {
      setForm({
        first_name: student.first_name || "",
        last_name:  student.last_name  || "",
        email:      student.email      || "",
        password:   "",                       // parol o'zgarmasa bo'sh qoladi
        phone:      student.phone      || "",
        address:    student.address    || "",
        birth_date: student.birth_date
          ? new Date(student.birth_date).toISOString().split("T")[0]
          : "",
        photo: null,
      });
      setPreview(student.photo ? `${PHOTO_BASE}${student.photo}` : null);
      setError(null);
    }
    if (open && !isEdit) {
      setForm(INITIAL);
      setPreview(null);
      setError(null);
    }
  }, [open, student]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handlePhoto = (file) => {
    if (!file) return;
    set("photo", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setError("Majburiy maydonlarni to'ldiring"); return;
    }
    if (!isEdit && !form.password) {
      setError("Parolni kiriting"); return;
    }

    try {
      setLoading(true); setError(null);
      const token = getToken();
      const body  = new FormData();

      body.append("first_name", form.first_name);
      body.append("last_name",  form.last_name);
      body.append("email",      form.email);
      body.append("phone",      form.phone);
      body.append("address",    form.address);
      if (form.birth_date) body.append("birth_date", form.birth_date);
      if (form.photo)      body.append("photo",      form.photo);

      // Parol: create da majburiy, edit da faqat kiritilsa yuboriladi
      if (!isEdit || form.password) {
        body.append("password", form.password);
      }

      const url    = isEdit ? `${UPDATE_URL}/${student.id}` : CREATE_URL;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(j.message) ? j.message.join(", ") : j.message || `Xato: ${res.status}`);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm(INITIAL); setPreview(null); setError(null); onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/25 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[370px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {isEdit ? "Talabani tahrirlash" : "Talaba qo'shish"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit
                ? `${student.first_name} ${student.last_name} ma'lumotlarini tahrirlash`
                : "Bu yerda siz yangi Talaba qo'shishingiz mumkin."}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Ism */}
          <div>
            <FieldLabel required>Ism</FieldLabel>
            <TextInput
              autoComplete="off"
              placeholder="Ismni kiriting"
              value={form.first_name}
              onChange={e => set("first_name", e.target.value)}
            />
          </div>

          {/* Familiya */}
          <div>
            <FieldLabel required>Familiya</FieldLabel>
            <TextInput
              autoComplete="off"
              placeholder="Familiyani kiriting"
              value={form.last_name}
              onChange={e => set("last_name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <FieldLabel required>Email</FieldLabel>
            <TextInput
              type="email"
              autoComplete="new-email"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
            />
          </div>

          {/* Parol */}
          <div>
            <FieldLabel required={!isEdit}>
              Parol {isEdit && <span className="text-gray-300 font-normal">(o'zgartirmasangiz bo'sh qoldiring)</span>}
            </FieldLabel>
            <div className="relative">
              <TextInput
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder={isEdit ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Telefon */}
          <div>
            <FieldLabel required>Telefon</FieldLabel>
            <TextInput
              autoComplete="off"
              placeholder="+998901234567"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
            />
          </div>

          {/* Manzil */}
          <div>
            <FieldLabel>Manzil</FieldLabel>
            <TextInput
              autoComplete="off"
              placeholder="Shahar, ko'cha"
              value={form.address}
              onChange={e => set("address", e.target.value)}
            />
          </div>

          {/* Tug'ilgan sana */}
          <div>
            <FieldLabel>Tug'ilgan sana</FieldLabel>
            <TextInput
              type="date"
              value={form.birth_date}
              onChange={e => set("birth_date", e.target.value)}
            />
          </div>

          {/* Surati */}
          <div>
            <FieldLabel>Surati</FieldLabel>
            <div
              onDrop={e => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition-all"
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
                  <span className="text-[10px] text-gray-300">JPG yoki PNG (max 2mb)</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => handlePhoto(e.target.files[0])} className="hidden" />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
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
              <><Loader2 size={13} className="animate-spin" />Saqlanmoqda...</>
            ) : isEdit ? (
              <><Save size={13} />Saqlash</>
            ) : (
              <><Plus size={13} />Qo'shish</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}