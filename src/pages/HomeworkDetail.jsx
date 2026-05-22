import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Loader2, X, Send,
} from "lucide-react";

const BASE = "http://localhost:3000";

const UZ_MONTHS = ["Yan","Fev","Mar","Apr","May","Iyu","Iyu","Avg","Sen","Okt","Noy","Dek"];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

async function fetchAPI(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  return res.json();
}

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = UZ_MONTHS[d.getMonth()];
  const yr  = d.getFullYear();
  const hh  = String(d.getHours()).padStart(2, "0");
  const mm  = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon}, ${yr} ${hh}:${mm}`;
}

const TABS = [
  { key: "waiting",  label: "Kutayotganlar",     bg: "bg-amber-500" },
  { key: "returned", label: "Qaytarilganlar",    bg: "bg-red-400"   },
  { key: "accepted", label: "Qabul qilinganlar", bg: "bg-green-500" },
  { key: "missed",   label: "Bajarilmagan",      bg: "bg-gray-400"  },
];

function buildTabData(answers, groupStudents) {
  const submittedStudentIds = new Set(
    answers.map((a) => a.students?.id ?? a.student_id)
  );

  const waiting  = [];
  const returned = [];
  const accepted = [];

  for (const ans of answers) {
    const result = ans.homeworkResults?.[0] ?? null;
    const grade  = result?.grade ?? null;

    const row = {
      answerId:     ans.id,
      student_id:   ans.students?.id ?? ans.student_id,
      first_name:   ans.students?.first_name ?? "—",
      last_name:    ans.students?.last_name  ?? "",
      photo:        ans.students?.photo      ?? null,
      submitted_at: ans.created_at,
      grade,
      title:        result?.title  ?? "",
      result_id:    result?.id     ?? null,
    };

    if (grade === null)   waiting.push(row);
    else if (grade < 60)  returned.push(row);
    else                  accepted.push(row);
  }

  // Guruh studentlaridan topshirmaganlarni ajrat
  const missed = groupStudents
    .filter((s) => !submittedStudentIds.has(s.id))
    .map((s) => ({
      answerId:     null,
      student_id:   s.id,
      first_name:   s.first_name ?? s.firstName ?? "—",
      last_name:    s.last_name  ?? s.lastName  ?? "",
      photo:        s.photo      ?? null,
      submitted_at: null,
      grade:        null,
      result_id:    null,
    }));

  return { waiting, returned, accepted, missed };
}

/* ── AVATAR ── */
function Avatar({ first, last, photo }) {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  const colors = [
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
  ];
  const color = colors[(first?.charCodeAt(0) ?? 0) % colors.length];

  if (photo) {
    return (
      <img
        src={`${BASE}/uploads/${photo}`}
        alt={first}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

/* ── GRADE MODAL ── */
function GradeModal({ student, onClose, onSaved }) {
  const [grade,   setGrade]   = useState(student.grade ?? "");
  const [comment, setComment] = useState(student.title ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    const g = Number(grade);
    if (isNaN(g) || g < 0 || g > 100) {
      setError("Ball 0 dan 100 gacha bo'lishi kerak");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res;
      if (student.result_id) {
        res = await fetchAPI(`${BASE}/api/homework-result/${student.result_id}`, {
          method: "PATCH",
          body: JSON.stringify({ grade: g, title: comment || "Baholandi", status: g >= 60 }),
        });
      } else {
        res = await fetchAPI(`${BASE}/api/homework-result`, {
          method: "POST",
          body: JSON.stringify({
            homework_answer_id: student.answerId,
            grade:  g,
            title:  comment || "Baholandi",
            status: g >= 60,
          }),
        });
      }
      if (!res.success) throw new Error(res.message || "Xatolik");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Serverda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Ball berish</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
          <Avatar first={student.first_name} last={student.last_name} photo={student.photo} />
          <span className="text-sm font-medium text-gray-700">
            {student.first_name} {student.last_name}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Ball <span className="text-red-500">*</span>
          </label>
          <input
            type="number" min={0} max={100}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="0 – 100"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Izoh</label>
          <textarea
            rows={3} value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ixtiyoriy izoh..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        {grade !== "" && !isNaN(Number(grade)) && (
          <div className={`text-center text-xs font-semibold py-1.5 rounded-lg
            ${Number(grade) >= 60 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {Number(grade) >= 60 ? "✓ Qabul qilinadi" : "✗ Qaytariladi"}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bekor
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── STUDENT ROW ── */
function StudentRow({ student, activeTab, onGradeClick }) {
  const showScore = activeTab === "returned" || activeTab === "accepted";
  const canGrade  = activeTab !== "missed";

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar first={student.first_name} last={student.last_name} photo={student.photo} />
          <span className="text-sm text-gray-800">
            {student.first_name} {student.last_name}
          </span>
        </div>
      </td>
      <td className="px-6 py-3.5 text-sm text-gray-500">
        {student.submitted_at ? formatDateTime(student.submitted_at) : "—"}
      </td>
      {showScore && (
        <td className="px-6 py-3.5">
          <span className={`text-sm font-semibold ${student.grade >= 60 ? "text-green-600" : "text-red-500"}`}>
            {student.grade}
          </span>
        </td>
      )}
      {canGrade && (
        <td className="px-6 py-3.5 text-right">
          <button
            onClick={() => onGradeClick(student)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
          >
            {student.grade !== null ? "Qayta baholash" : "Ball berish"}
          </button>
        </td>
      )}
    </tr>
  );
}

/* ── EMPTY STATE ── */
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <FileText size={32} className="text-gray-200" />
      <p className="text-sm text-gray-400">{label} mavjud emas</p>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function HomeworkDetailPage() {
  const navigate = useNavigate();
  const { groupId, homeworkId } = useParams();

  const [activeTab,    setActiveTab]    = useState("waiting");
  const [homework,     setHomework]     = useState(null);
  const [tabData,      setTabData]      = useState({ waiting: [], returned: [], accepted: [], missed: [] });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [gradeStudent, setGradeStudent] = useState(null);

  const load = useCallback(async () => {
    if (!homeworkId) return;
    setLoading(true);
    setError(null);
    try {
      // 1) Topshirgan o'quvchilar + homework ma'lumoti answers ichida keladi
      const ansRes = await fetchAPI(`${BASE}/api/homework-answer/homework/${homeworkId}`);
      const answers = ansRes.success ? (ansRes.data ?? []) : [];

      // Homework ma'lumotini answers'dan olish
      if (answers.length > 0 && answers[0].homework) {
        setHomework(answers[0].homework);
      }

      // 2) Guruh barcha o'quvchilari — /api/groups/one/students/:groupId
      let groupStudents = [];
      if (groupId) {
        const grRes = await fetchAPI(`${BASE}/api/groups/one/students/${groupId}`);
        // Response strukturasiga qarab olish
        if (grRes.success) {
          groupStudents = grRes.data?.students ?? grRes.data ?? [];
        }
      }

      setTabData(buildTabData(answers, groupStudents));
    } catch {
      setError("Ma'lumot yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [homeworkId, groupId]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    waiting:  tabData.waiting.length,
    returned: tabData.returned.length,
    accepted: tabData.accepted.length,
    missed:   tabData.missed.length,
  };

  const rows     = tabData[activeTab] ?? [];
  const showScore = activeTab === "returned" || activeTab === "accepted";
  const canGrade  = activeTab !== "missed";

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">

        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate">
            {loading ? "Yuklanmoqda..." : (homework?.title ?? "Uyga vazifa")}
          </h1>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">

          {/* Info card */}
          {homework && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Mavzu</span>
                <span className="text-sm font-semibold text-gray-800">{homework.title}</span>
              </div>
            </div>
          )}

          {/* Tabs + Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab row */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-1">
              {TABS.map(({ key, label, bg }) => {
                const count    = counts[key];
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                      ${isActive ? "text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {label}
                    {count > 0 && (
                      <span className={`${isActive ? bg : "bg-gray-200"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none transition-colors`}>
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${bg} rounded-full`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Loader2 size={18} className="animate-spin text-green-500" />
                <span className="text-xs text-gray-400">Yuklanmoqda...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <span className="text-xs text-red-400">{error}</span>
              </div>
            ) : rows.length === 0 ? (
              <EmptyState label={TABS.find((t) => t.key === activeTab)?.label} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
                      O'quvchi ismi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
                      {activeTab === "missed" ? "" : "Uyga vazifa jo'natilgan vaqt"}
                    </th>
                    {showScore && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
                        Ball
                      </th>
                    )}
                    {canGrade && <th className="px-6 py-3 w-36" />}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((student) => (
                    <StudentRow
                      key={student.answerId ?? student.student_id}
                      student={student}
                      activeTab={activeTab}
                      onGradeClick={setGradeStudent}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {gradeStudent && (
        <GradeModal
          student={gradeStudent}
          onClose={() => setGradeStudent(null)}
          onSaved={load}
        />
      )}
    </>
  );
}