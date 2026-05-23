import { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Eye, EyeOff, Loader2, Save } from "lucide-react";

const CREATE_URL = "http://localhost:3000/api/teachers/create";
const UPDATE_URL = "http://localhost:3000/api/teachers/update";
const PHOTO_BASE = "http://localhost:3000/uploads/";

const INITIAL_FORM = {
  first_name: "", last_name: "", email: "",
  password: "", phone: "", address: "", photo: null,
};

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
}

export default function AddTeacherDrawer({ open, onClose, onSuccess, teacher }) {
  const isEdit = !!teacher;

  const [form,         setForm]         = useState(INITIAL_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (open && isEdit) {
      setForm({
        first_name: teacher.first_name || "",
        last_name:  teacher.last_name  || "",
        email:      teacher.email      || "",
        password:   "",
        phone:      teacher.phone      || "",
        address:    teacher.address    || "",
        photo:      null,
      });
      setPhotoPreview(teacher.photo ? `${PHOTO_BASE}${teacher.photo}` : null);
      setError(null);
    }
    if (open && !isEdit) {
      setForm(INITIAL_FORM);
      setPhotoPreview(null);
      setError(null);
    }
  }, [open, teacher]);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhoto = (file) => {
    if (!file) return;
    setForm((p) => ({ ...p, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setError("Barcha majburiy maydonlarni to'ldiring"); 
      return;
    }
    if (!isEdit && !form.password) {
      setError("Parolni kiriting"); 
      return;
    }

    setLoading(true); 
    setError(null);

    try {
      const token = getToken();
      const body  = new FormData();
      body.append("first_name", form.first_name);
      body.append("last_name",  form.last_name);
      body.append("email",      form.email);
      body.append("phone",      form.phone);
      body.append("address",    form.address);
      if (form.photo)                    body.append("photo",    form.photo);
      if (!isEdit || form.password)      body.append("password", form.password);

      const url    = isEdit ? `${UPDATE_URL}/${teacher.id}` : CREATE_URL;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(json.message) ? json.message.join(", ") : json.message || `Xato: ${res.status}`);
      }

      // Success - call callbacks and reset
      onSuccess?.();

      // Reset form state before closing
      setForm(INITIAL_FORM);
      setPhotoPreview(null);
      setError(null);

      // Close drawer
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
      <div onClick={handleClose}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {isEdit ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit
                ? `${teacher.first_name} ${teacher.last_name} ma'lumotlarini tahrirlash`
                : "Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin."}
            </p>
          </div>
          <button onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {[
            { name: "first_name", label: "Ism",      placeholder: "Ismni kiriting",      required: true },
            { name: "last_name",  label: "Familiya", placeholder: "Familiyani kiriting", required: true },
            { name: "email",      label: "Email",    placeholder: "email@example.com",   required: true, type: "email" },
            { name: "phone",      label: "Telefon",  placeholder: "+998901234567",        required: true },
            { name: "address",    label: "Manzil",   placeholder: "Shahar, ko'cha",       required: false },
          ].map(({ name, label, placeholder, required, type = "text" }) => (
            <div key={name}>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
              </label>
              <input name={name} type={type} autoComplete="off"
                value={form[name]} onChange={handleChange} placeholder={placeholder}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" />
            </div>
          ))}

          {/* Parol */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Parol {!isEdit && <span className="text-red-400">*</span>}
              {isEdit && <span className="text-gray-300 font-normal"> (o'zgartirmasangiz bo'sh qoldiring)</span>}
            </label>
            <div className="relative">
              <input name="password" type={showPass ? "text" : "password"} autoComplete="new-password"
                value={form.password} onChange={handleChange}
                placeholder={isEdit ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                className="w-full px-3 py-2 pr-9 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" />
              <button type="button" onClick={() => setShowPass((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Surati */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Surati</label>
            <div onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
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
            <input ref={fileRef} type="file" accept="image/*"
              onChange={(e) => handlePhoto(e.target.files[0])} className="hidden" />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          <button onClick={handleClose} disabled={loading}
            className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
            {loading ? (
              <><Loader2 size={13} className="animate-spin" /> Saqlanmoqda...</>
            ) : isEdit ? (
              <><Save size={13} /> Saqlash</>
            ) : (
              <><Plus size={13} /> Qo'shish</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}