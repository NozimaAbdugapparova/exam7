import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const BASE = "http://localhost:3000";

const LESSON_DURATIONS = [
  { label: "60 daqiqa",  value: 1 },
  { label: "90 daqiqa",  value: 1.5 },
  { label: "120 daqiqa", value: 2 },
  { label: "180 daqiqa", value: 3 },
];
const COURSE_DURATIONS = [
  { label: "1 oy",  value: 1  },
  { label: "2 oy",  value: 2  },
  { label: "3 oy",  value: 3  },
  { label: "4 oy",  value: 4  },
  { label: "6 oy",  value: 6  },
  { label: "8 oy",  value: 8  },
  { label: "12 oy", value: 12 },
];
const LEVELS = [
  { label: "Boshlang'ich", value: "beginner"     },
  { label: "O'rta",        value: "intermediate" },
  { label: "Yuqori",       value: "advanced"     },
];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function AddCourseDrawer({ open, onClose, onSave, editingCourse }) {
  const isEditing = !!editingCourse;

  const [form, setForm] = useState({
    name:           "",
    lessonDuration: "",
    courseDuration: "",
    price:          "",
    description:    "",
    level:          "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Populate form when editingCourse changes
  useEffect(() => {
    if (editingCourse) {
      setForm({
        name:           editingCourse.name || "",
        lessonDuration: editingCourse.duration_hours?.toString() || editingCourse.lesson_duration?.toString() || "",
        courseDuration: editingCourse.duration_month?.toString() || "",
        price:          editingCourse.price?.toString() || "",
        description:    editingCourse.description || "",
        level:          editingCourse.level || "",
      });
    } else {
      setForm({ name: "", lessonDuration: "", courseDuration: "", price: "", description: "", level: "" });
    }
    setError("");
  }, [editingCourse, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");

    if (!form.name.trim())     { setError("Kurs nomini kiriting");      return; }
    if (!form.lessonDuration)  { setError("Dars davomiyligini tanlang"); return; }
    if (!form.courseDuration)  { setError("Kurs davomiyligini tanlang"); return; }
    if (!form.price)           { setError("Narxni kiriting");            return; }
    if (!form.level)           { setError("Darajani tanlang");           return; }

    setLoading(true);
    try {
      const token = getToken();
      const body = {
        name:           form.name.trim(),
        description:    form.description.trim(),
        price:          Number(form.price),
        duration_hours: Number(form.lessonDuration),
        duration_month: Number(form.courseDuration),
        level:          form.level,
      };

      let res;
      if (isEditing) {
        res = await fetch(`${BASE}/api/courses/update/${editingCourse.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${BASE}/api/courses/add/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      onSave?.(data);
      handleClose();
    } catch (err) {
      setError(err.message || "Serverda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", lessonDuration: "", courseDuration: "", price: "", description: "", level: "" });
    setError("");
    onClose();
  };

  const inputClass  = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none transition focus:border-[#3d5af1] focus:ring-2 focus:ring-[#3d5af1]/10";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-[300px] max-w-full
        bg-white shadow-2xl z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Kursni tahrirlash" : "Kurs qo'shish"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {isEditing 
                ? "Bu yerda siz kurs ma'lumotlarini o'zgartirishingiz mumkin."
                : "Bu yerda siz yangi kurs qo'shishingiz mumkin."
              }
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-5">

          {/* Nomi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Kurs nomini kiriting..."
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Dars davomiyligi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Dars davomiyligi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.lessonDuration}
                onChange={(e) => handleChange("lessonDuration", e.target.value)}
                className={selectClass}
              >
                <option value="">Tanlang</option>
                {LESSON_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Kurs davomiyligi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Kurs davomiyligi (oylarda) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.courseDuration}
                onChange={(e) => handleChange("courseDuration", e.target.value)}
                className={selectClass}
              >
                <option value="">Tanlang</option>
                {COURSE_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Daraja */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Daraja <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.level}
                onChange={(e) => handleChange("level", e.target.value)}
                className={selectClass}
              >
                <option value="">Tanlang</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Narx */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Narx <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Narxini kiriting"
              value={form.price ? Number(form.price).toLocaleString("uz-UZ") : ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange("price", val);
              }}
              className={inputClass}
            />
            {form.price && (
              <span className="text-xs text-gray-400">
                {Number(form.price).toLocaleString("uz-UZ")} so'm
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Tavsif</label>
            <textarea
              rows={4}
              placeholder="Kurs haqida qisqacha..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Error */}
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
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#3d5af1] hover:bg-[#2a47d6] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <Loader2 className="animate-spin w-4 h-4" />
            )}
            {isEditing ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </div>
    </>
  );
}