import { useState } from "react";
import { X } from "lucide-react";

const LESSON_DURATIONS = ["60 daqiqa", "90 daqiqa", "120 daqiqa"];
const COURSE_DURATIONS  = ["1 oy", "2 oy", "3 oy", "4 oy", "6 oy", "8 oy", "12 oy"];

export default function AddCourseDrawer({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name:           "",
    lessonDuration: "",
    courseDuration: "",
    price:          "",
    description:    "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave?.(form);
    onClose();
    setForm({
      name: "", lessonDuration: "", courseDuration: "",
      price: "", description: "",
    });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none transition focus:border-[#3d5af1] focus:ring-2 focus:ring-[#3d5af1]/10";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[300px] max-w-full
          bg-white shadow-2xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Kurs qo'shish</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Bu yerda siz yangi kurs qo'shishingiz mumkin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-5">

          {/* Nomi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nomi</label>
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
            <label className="text-sm font-medium text-gray-700">Dars davomiyligi</label>
            <div className="relative">
              <select
                value={form.lessonDuration}
                onChange={(e) => handleChange("lessonDuration", e.target.value)}
                className={selectClass}
              >
                <option value="">Tanlang</option>
                {LESSON_DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Kurs davomiyligi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Kurs davomiyligi (oylarda)</label>
            <div className="relative">
              <select
                value={form.courseDuration}
                onChange={(e) => handleChange("courseDuration", e.target.value)}
                className={selectClass}
              >
                <option value="">Tanlang</option>
                {COURSE_DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Narx */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Narx</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Narxini kiriting"
              value={form.price}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange("price", val);
              }}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              placeholder="Kurs haqida qisqacha..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#3d5af1] hover:bg-[#2a47d6] rounded-lg transition-colors"
          >
            Saqlash
          </button>
        </div>
      </div>
    </>
  );
}