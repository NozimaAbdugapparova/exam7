import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BASE = "http://localhost:3000";
const CAL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
}

function api(url, opts = {}) {
  const token = getToken();
  return fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers,
    },
  }).then((r) => r.json());
}

function formatDateLabel(d) {
  return `${d.getDate()} ${CAL_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ firstName = "", lastName = "", photo, size = "sm" }) {
  const [err, setErr] = useState(false);
  const initials = (firstName[0] || "").toUpperCase() + (lastName[0] || "").toUpperCase();
  const src = photo ? `${BASE}/uploads/${photo}` : null;
  const cls = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  if (!src || err) {
    return (
      <div style={{ backgroundColor: stringToColor(firstName + lastName) }}
        className={`${cls} rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs`}>
        {initials}
      </div>
    );
  }
  return <img src={src} alt={initials} onError={() => setErr(true)}
    className={`${cls} rounded-full object-cover shrink-0 border border-gray-200`} />;
}

/* ── ATTENDANCE TOGGLE ── */
function AttendanceToggle({ present, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        present ? "bg-blue-500" : "bg-gray-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        present ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

/* ── MINI CALENDAR ── */
function MiniCalendar({ selectedDate, onSelect, weekOffset, setWeekOffset }) {
  const today = new Date();
  const startOfRange = new Date(today);
  startOfRange.setDate(today.getDate() + weekOffset * 7);

  const calDays = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(startOfRange);
    d.setDate(startOfRange.getDate() + i - 7);
    return d;
  });

  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-hide">
      {calDays.map((d, i) => {
        const isSelected = d.toDateString() === selectedDate.toDateString();
        const isToday = d.toDateString() === today.toDateString();
        return (
          <button key={i} onClick={() => onSelect(d)}
            className={`flex flex-col items-center px-2 py-1.5 rounded-lg min-w-[44px] transition-colors
              ${isSelected ? "bg-blue-500 text-white" : isToday ? "bg-blue-100 text-blue-700" : "bg-gray-50 hover:bg-gray-100 text-gray-600"}`}>
            <span className={`text-[9px] font-medium ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
              {CAL_MONTHS[d.getMonth()]}
            </span>
            <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── MAIN ── */
export default function LessonDetail() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const { role }    = useAuth();

  const [group, setGroup]           = useState(null);
  const [students, setStudents]     = useState([]);
  const [lessons, setLessons]       = useState([]);
  const [attendance, setAttendance] = useState([]); // [{student_id, isPresent, id}]
  const [activeLesson, setActiveLesson] = useState(null);

  const [theme, setTheme]           = useState("");
  const [description, setDesc]      = useState("");
  const [topicType, setTopicType]   = useState("other"); // "plan" | "other"
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonSaved, setLessonSaved]   = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset]     = useState(0);
  const [activeTab, setActiveTab]       = useState("teacher"); // "assistant" | "teacher"

  const [loading, setLoading] = useState(true);
  const [attLoading, setAttLoading] = useState({});

  // Load group info + students + lessons
  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    const promises = [
      api(`/api/groups/${groupId}`),
      role === "student" ? Promise.resolve({ success: true, data: [] }) : api(`/api/groups/one/students/${groupId}`),
      api(`/api/lessons/my/group/${groupId}`),
    ];
    Promise.all(promises)
      .then(([grp, stud, less]) => {
        if (grp.success)  setGroup(grp.data);
        if (stud.success) setStudents(stud.data || []);
        if (less.success) {
          setLessons(less.data || []);
          if (less.data?.length > 0) setActiveLesson(less.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [groupId, role]);

  // Load attendance when lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    api(`/api/attendance/all`)
      .then((j) => {
        if (j.success) {
          const forLesson = j.data.filter((a) => a.lesson_id === activeLesson.id);
          setAttendance(forLesson);
        }
      })
      .catch(() => {});
  }, [activeLesson]);

  // Save new lesson
  const handleSaveLesson = async () => {
    if (!theme.trim()) return;
    setSavingLesson(true);
    try {
      const res = await api("/api/lessons/new", {
        method: "POST",
        body: JSON.stringify({ group_id: Number(groupId), theme, description }),
      });
      if (res.success) {
        setLessonSaved(true);
        setActiveLesson(res.data);
        setLessons((p) => [res.data, ...p]);
      }
    } catch {}
    finally { setSavingLesson(false); }
  };

  // Toggle attendance
  const handleToggleAttendance = async (student) => {
    if (!activeLesson) return;
    const existing = attendance.find((a) => a.student_id === student.id);
    const newValue = !existing?.isPresent;
    setAttLoading((p) => ({ ...p, [student.id]: true }));
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ lesson_id: activeLesson.id, student_id: student.id, isPresent: newValue }),
      });
      setAttendance((prev) => {
        const without = prev.filter((a) => a.student_id !== student.id);
        return [...without, { student_id: student.id, lesson_id: activeLesson.id, isPresent: newValue }];
      });
    } catch {}
    finally { setAttLoading((p) => ({ ...p, [student.id]: false })); }
  };

  const teacher = group?.teachers;
  const groupName = group?.name || "Guruh";
  const dateLabel = formatDateLabel(selectedDate);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-white border border-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-base font-bold text-gray-800">{groupName}</h1>
      </div>

      {/* Week label + Calendar */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setWeekOffset((p) => p - 1)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold">
            ‹
          </button>
          <span className="text-xs font-semibold text-gray-600">7-o'quv oyi</span>
          <button onClick={() => setWeekOffset((p) => p + 1)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold">
            ›
          </button>
        </div>
        <MiniCalendar
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
        </div>
      ) : (
        <div className="px-5 space-y-4 pb-6">

          {/* Teacher tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {["assistant","teacher"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}>
                {tab === "teacher" ? "Teacher" : "Assistant"}
              </button>
            ))}
          </div>

          {/* Teacher info card */}
          {teacher && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 mb-3">Ma'lumot</p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar firstName={teacher.first_name} lastName={teacher.last_name} photo={teacher.photo} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{teacher.last_name} {teacher.first_name}</p>
                  <p className="text-xs text-gray-400">Teacher</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Dars kuni",  value: dateLabel },
                  { label: "Dars vaqti", value: group?.start_time || "—" },
                  { label: "Filial",     value: group?.branch?.name || "—" },
                  { label: "Xona",       value: group?.rooms?.name || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group + date title */}
          <p className="text-xs font-semibold text-gray-600">{groupName} {selectedDate.toLocaleDateString("ru")}</p>

          {/* Student specific lesson detail view */}
          {role === "student" && activeLesson && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">Dars Mavzusi</h3>
              <div>
                <p className="text-xs text-gray-400 font-semibold">Mavzu nomi</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{activeLesson.theme || "Mavzu kiritilmagan"}</p>
              </div>
              {activeLesson.description && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Tavsif / Vazifalar</p>
                  <p className="text-sm text-gray-600 mt-1">{activeLesson.description}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <span className="text-xs text-gray-500">Dars sanasi: {formatDateLabel(new Date(activeLesson.created_at))}</span>
              </div>
            </div>
          )}

          {/* Topic entry card for non-students */}
          {role !== "student" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Yo'qlama va mavzu kiritish</h3>

              {/* Topic type radio */}
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="radio" name="topicType" value="plan" checked={topicType === "plan"}
                    onChange={() => setTopicType("plan")}
                    className="accent-blue-500" />
                  O'quv reja bo'yicha
                </label>
                <label className="flex items-center gap-1.5 text-xs text-blue-600 font-medium cursor-pointer">
                  <input type="radio" name="topicType" value="other" checked={topicType === "other"}
                    onChange={() => setTopicType("other")}
                    className="accent-blue-500" />
                  Boshqa
                </label>
              </div>

              {/* Theme input */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">* Mavzu</label>
                <input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={activeLesson?.theme || "CRM groupinner full"}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tavsif</label>
                <input
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Qo'shimcha ma'lumot..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
              </div>

              <button
                onClick={handleSaveLesson}
                disabled={savingLesson || !theme.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingLesson ? <Loader2 size={12} className="animate-spin" /> : null}
                {lessonSaved ? "Saqlandi ✓" : "Saqlash"}
              </button>
            </div>
          )}

          {/* Attendance table for non-students */}
          {role !== "student" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-8">#</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">O'quvchi ismi</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Vaqti</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Keldi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-xs text-gray-400">Talabalar topilmadi</td></tr>
                  ) : students.map((s, i) => {
                    const att = attendance.find((a) => a.student_id === s.id);
                    const isPresent = att?.isPresent ?? false;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar firstName={s.first_name} lastName={s.last_name} photo={s.photo} />
                            <span className="text-xs font-medium text-gray-800">
                              {s.last_name} {s.first_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 text-right">
                          {group?.start_time || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AttendanceToggle
                            present={isPresent}
                            onChange={() => handleToggleAttendance(s)}
                            loading={attLoading[s.id]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}