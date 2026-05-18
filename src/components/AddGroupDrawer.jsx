import { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";

const WEEK_DAYS = [
  { key: "MONDAY",    label: "Dushanba" },
  { key: "TUESDAY",   label: "Seshanba"  },
  { key: "WEDNESDAY", label: "Chorshanba" },
  { key: "THURSDAY",  label: "Payshanba" },
  { key: "FRIDAY",    label: "Juma"      },
  { key: "SATURDAY",  label: "Shanba"    },
  { key: "SUNDAY",    label: "Yakshanba" },
];

const INITIAL = {
  name: "", description: "", course_id: "", teacher_id: "",
  room_id: "", start_date: "", start_time: "09:00",
  max_student: "", week_day: [],
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

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />}
      <input
        {...props}
        className={`w-full text-xs border border-gray-200 rounded-lg outline-none bg-white placeholder-gray-300
          focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all
          ${Icon ? "pl-8 pr-3 py-2" : "px-3 py-2"}`}
      />
    </div>
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white text-gray-700
        focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none"
    >
      {children}
    </select>
  );
}

export default function AddGroupDrawer({ open, onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Lists from API
  const [courses,  setCourses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms,    setRooms]    = useState([]);

  useEffect(() => {
    if (!open) return;
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
    const load = (url, setter) =>
      fetch(url, { headers })
        .then(r => r.json())
        .then(j => j.success && setter(j.data))
        .catch(() => {});
    load("http://localhost:3000/api/courses/all",  setCourses);
    load("http://localhost:3000/api/teachers/all", setTeachers);
    load("http://localhost:3000/api/rooms/all",    setRooms);
  }, [open]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleDay = (day) =>
    setForm(p => ({
      ...p,
      week_day: p.week_day.includes(day)
        ? p.week_day.filter(d => d !== day)
        : [...p.week_day, day],
    }));

  const handleSubmit = async () => {
    if (!form.name || !form.course_id || !form.room_id || !form.start_date || form.week_day.length === 0) {
      setError("Majburiy maydonlarni to'ldiring"); return;
    }
    try {
      setLoading(true); setError(null);
      const token = getToken();
      const body = {
        name:        form.name,
        description: form.description || undefined,
        course_id:   Number(form.course_id),
        teacher_id:  form.teacher_id ? Number(form.teacher_id) : undefined,
        room_id:     Number(form.room_id),
        start_date:  form.start_date,
        start_time:  form.start_time,
        week_day:    form.week_day,
        max_student: form.max_student ? Number(form.max_student) : undefined,
      };
      const res = await fetch("http://localhost:3000/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(j.message) ? j.message.join(", ") : j.message || `Xato: ${res.status}`);
      }
      setForm(INITIAL);
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
    setForm(INITIAL); setError(null); onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/25 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[360px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Guruh qo'shish</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Guruh nomi */}
          <div>
            <FieldLabel required>Guruh nomi</FieldLabel>
            <TextInput placeholder="Frontend 2024" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>

          {/* Tavsif */}
          <div>
            <FieldLabel>Tavsif</FieldLabel>
            <textarea
              rows={2}
              placeholder="Guruh haqida qisqacha..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white placeholder-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Kurs */}
          <div>
            <FieldLabel required>Kurs</FieldLabel>
            <div className="relative">
              <SelectInput value={form.course_id} onChange={e => set("course_id", e.target.value)}>
                <option value="">Kursni tanlang</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectInput>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          {/* Xona */}
          <div>
            <FieldLabel required>Xona</FieldLabel>
            <div className="relative">
              <SelectInput value={form.room_id} onChange={e => set("room_id", e.target.value)}>
                <option value="">Xonani tanlang</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </SelectInput>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          {/* Dars kunlari */}
          <div>
            <FieldLabel required>Dars kunlari</FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {WEEK_DAYS.map(({ key, label }) => {
                const checked = form.week_day.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                      checked
                        ? "border-blue-400 bg-blue-50 text-blue-600 font-medium"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    }`}>
                      {checked && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dars vaqti */}
          <div>
            <FieldLabel required>Dars vaqti</FieldLabel>
            <TextInput type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} />
          </div>

          {/* Boshlanish sanasi */}
          <div>
            <FieldLabel required>Boshlanish sanasi</FieldLabel>
            <TextInput type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
          </div>

          {/* Max talaba */}
          <div>
            <FieldLabel>Maksimal talabalar soni</FieldLabel>
            <TextInput type="number" placeholder="20" value={form.max_student} onChange={e => set("max_student", e.target.value)} />
          </div>

          {/* O'qituvchi */}
          <div>
            <FieldLabel>O'qituvchi</FieldLabel>
            <div className="relative">
              <SelectInput value={form.teacher_id} onChange={e => set("teacher_id", e.target.value)}>
                <option value="">O'qituvchini tanlang</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </SelectInput>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[10px]">▼</span>
            </div>
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
            {loading
              ? <><Loader2 size={13} className="animate-spin" />Saqlanmoqda...</>
              : <><Plus size={13} />Saqlash</>}
          </button>
        </div>
      </div>
    </>
  );
}