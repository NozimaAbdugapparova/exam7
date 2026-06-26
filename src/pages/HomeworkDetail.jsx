import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Loader2, X, CloudUpload, Info, Mic,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
      ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  return res.json();
}

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2,"0")} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const TABS = [
  { key: "waiting",  label: "Kutayotganlar",     bg: "bg-amber-500",  line: "bg-amber-500"  },
  { key: "returned", label: "Qaytarilganlar",    bg: "bg-red-400",    line: "bg-red-400"    },
  { key: "accepted", label: "Qabul qilinganlar", bg: "bg-green-500",  line: "bg-green-500"  },
  { key: "missed",   label: "Bajarilmagan",      bg: "bg-gray-400",   line: "bg-gray-400"   },
];

function buildTabData(answers, groupStudents) {
  const submittedIds = new Set(answers.map((a) => a.students?.id ?? a.student_id));
  const waiting = [], returned = [], accepted = [];

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
      file:         ans.file ?? null,
      title:        ans.title ?? "",
      grade,
      comment:      result?.title  ?? "",
      result_id:    result?.id     ?? null,
      status:       result?.status ?? null,
    };
    if (grade === null)   waiting.push(row);
    else if (grade < 60)  returned.push(row);
    else                  accepted.push(row);
  }

  const missed = (groupStudents ?? [])
    .filter((s) => !submittedIds.has(s.id))
    .map((s) => ({
      answerId: null, student_id: s.id,
      first_name: s.first_name ?? "—", last_name: s.last_name ?? "",
      photo: s.photo ?? null, submitted_at: null, grade: null, result_id: null,
    }));

  return { waiting, returned, accepted, missed };
}

/* ── AVATAR ── */
function Avatar({ first, last, photo }) {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  const colors = ["bg-violet-100 text-violet-600","bg-sky-100 text-sky-600","bg-emerald-100 text-emerald-600","bg-rose-100 text-rose-600","bg-amber-100 text-amber-600"];
  const color  = colors[(first?.charCodeAt(0) ?? 0) % colors.length];
  if (photo) return <img src={`${BASE}/uploads/${photo}`} alt={first} className="w-8 h-8 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display="none"; }} />;
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>{initials}</div>;
}

/* ══════════════════════════════════════════
   GRADE MODAL — rasmlar 2 va 3 asosida
══════════════════════════════════════════ */
function GradeModal({ student, onClose, onSaved }) {
  const [grade,    setGrade]    = useState(student.grade ?? 60);
  const [comment,  setComment]  = useState(student.comment ?? "");
  const [files,    setFiles]    = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const fileRef = useRef();

  const passed   = Number(grade) >= 60;
  const gradePct = Math.round((Number(grade) / 100) * 100);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles((p) => [...p, ...arr]);
  };

  const handleSubmit = async () => {
    if (!student.answerId) { setError("Answer ID topilmadi"); return; }
    setLoading(true); setError("");
    try {
      const body = new FormData();
      body.append("homework_answer_id", student.answerId);
      body.append("grade",  Number(grade));
      body.append("title",  comment || "Baholandi");
      body.append("status", passed ? "true" : "false");
      files.forEach((f) => body.append("files", f));

      let res;
      if (student.result_id) {
        // UPDATE
        const updateBody = { grade: Number(grade), title: comment || "Baholandi", status: passed };
        res = await fetchAPI(`${BASE}/api/homework-result/${student.result_id}`, {
          method: "PATCH",
          body: JSON.stringify(updateBody),
        });
      } else {
        // CREATE — FormData yuboriladi
        const token = getToken();
        const r = await fetch(`${BASE}/api/homework-result`, {
          method: "POST",
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          body,
        });
        res = await r.json();
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">

        {/* Breadcrumb header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-800">Kutayotganlar</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Uyga vazifa</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">

          {/* Homework description */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800">Uy vazifasi</p>
            {student.title && (
              <div>
                <span className="text-xs text-gray-400">Izoh:</span>
                <p className="text-sm text-gray-700 mt-0.5">{student.title}</p>
              </div>
            )}
          </div>

          {/* Student answer card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
            <p className="text-base font-bold text-gray-800">
              {student.first_name} {student.last_name}
            </p>

            {/* Meta */}
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Vaqti:</p>
                <p className="text-xs font-semibold text-gray-800">
                  {formatDateTime(student.submitted_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Fayllar soni:</p>
                <p className="text-xs font-semibold text-gray-800">
                  {student.file ? "1" : "0"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status:</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  student.grade === null ? "bg-yellow-100 text-yellow-700" :
                  student.grade >= 60    ? "bg-green-100 text-green-700"  :
                                           "bg-red-100 text-red-600"
                }`}>
                  {student.grade === null ? "Kutayabti" : student.grade >= 60 ? "Qabul qilindi" : "Qaytarildi"}
                </span>
              </div>
            </div>

            {/* Submitted file preview */}
            {student.file && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Fayl: <span className="font-bold">1</span></p>
                <div className="flex gap-2 flex-wrap">
                  {[student.file].map((f, i) => {
                    const url = `${BASE}/uploads/files/${f}`;
                    const ext = f.split(".").pop()?.toLowerCase();
                    const isImg = ["jpg","jpeg","png","gif","webp"].includes(ext);
                    return isImg ? (
                      <img key={i} src={url} alt="fayl" className="w-24 h-20 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-blue-600 hover:bg-blue-50">
                        <FileText size={13} />{f.slice(0, 20)}...
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Student comment */}
            {student.comment && (
              <div className="border-l-4 border-blue-400 pl-3 bg-blue-50/40 rounded-r-lg py-2">
                <p className="text-xs text-gray-400 mb-0.5">Uyga vazifa izohi:</p>
                <p className="text-xs text-blue-700 font-medium">{student.comment}</p>
              </div>
            )}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
            </p>
          </div>

          {/* Ball slider */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-800">Ball</p>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 py-4">
                {/* Track */}
                <div className="relative h-2 rounded-full bg-gray-200 w-full">
                  {/* Filled part */}
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full transition-all"
                    style={{ width: `${grade}%`, backgroundColor: passed ? "#22c55e" : "#ef4444" }}
                  />
                  {/* 60 marker line */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400 rounded-full z-10"
                    style={{ left: "60%" }} />
                  {/* Thumb */}
                  <input
                    type="range" min={0} max={100} value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ margin: 0 }}
                  />
                  {/* Custom thumb dot */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-md border-2 border-white z-10 pointer-events-none transition-all"
                    style={{
                      left: `calc(${grade}% - 10px)`,
                      backgroundColor: passed ? "#22c55e" : "#ef4444",
                    }}
                  />
                </div>
                {/* O'tish bali label */}
                <div className="absolute -bottom-0.5 text-[10px] text-gray-400 whitespace-nowrap"
                  style={{ left: "60%", transform: "translateX(-50%)" }}>
                  O'tish bali
                </div>
              </div>
              <div className="w-16 h-10 border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm">
                <input
                  type="number" min={0} max={100} value={grade}
                  onChange={(e) => setGrade(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full text-center text-sm font-semibold text-gray-800 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* File upload */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800">Fayllar</p>
            <div
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                dragOver ? "border-teal-400 bg-teal-50" : "border-teal-300 bg-teal-50/40 hover:bg-teal-50"
              }`}
            >
              <CloudUpload size={36} className="text-teal-400" />
              <p className="text-sm font-semibold text-gray-700 text-center">
                Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
              </p>
              <p className="text-xs text-gray-400">.jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin</p>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {files.map((f, i) => (
                    <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{f.name}</span>
                  ))}
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" multiple className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {/* Comment */}
          <div className="relative">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Izohingiz"
              className="w-full px-4 py-3 pr-12 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10 transition resize-none bg-gray-50"
            />
            <button className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition">
              <Mic size={14} />
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>
          )}

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1 pb-2">
            <button onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Yuborish
            </button>
          </div>
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
          <span className="text-sm text-gray-800">{student.first_name} {student.last_name}</span>
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
          <button onClick={() => onGradeClick(student)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
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
  const { role } = useAuth();

  const [activeTab,    setActiveTab]    = useState("waiting");
  const [homework,     setHomework]     = useState(null);
  const [tabData,      setTabData]      = useState({ waiting: [], returned: [], accepted: [], missed: [] });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [gradeStudent, setGradeStudent] = useState(null);

  // Student specific state
  const [studentAnswer, setStudentAnswer] = useState(null);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const load = useCallback(async () => {
    if (!homeworkId) return;
    setLoading(true); setError(null);
    try {
      if (role === "student") {
        // 1. Fetch student's own answers
        const ansRes = await fetchAPI(`${BASE}/api/homework-answer/my`);
        const answers = ansRes.success ? (ansRes.data ?? []) : [];
        const myAnswer = answers.find(a => a.homework?.id === Number(homeworkId) || a.homework_id === Number(homeworkId));
        
        if (myAnswer) {
          setStudentAnswer(myAnswer);
          setHomework(myAnswer.homework);
        } else {
          setStudentAnswer(null);
          // Lookup homework details by scanning lessons
          let foundHomework = null;
          const lessRes = await fetchAPI(`${BASE}/api/lessons/my/group/${groupId}`);
          if (lessRes.success) {
            const lessonsList = lessRes.data ?? [];
            const homeworkPromises = lessonsList.map((lesson) =>
              fetchAPI(`${BASE}/api/homework/own/${lesson.id}`).then((res) => {
                if (res.success && res.data) {
                  const m = res.data.find(hw => hw.id === Number(homeworkId));
                  if (m) foundHomework = m;
                }
              })
            );
            await Promise.all(homeworkPromises);
          }
          if (foundHomework) {
            setHomework(foundHomework);
          } else {
            setHomework({ title: "Uyga vazifa" });
          }
        }
      } else {
        // Admin / Teacher flow
        const ansRes = await fetchAPI(`${BASE}/api/homework-answer/homework/${homeworkId}`);
        const answers = ansRes.success ? (ansRes.data ?? []) : [];

        if (answers.length > 0 && answers[0].homework) setHomework(answers[0].homework);

        let groupStudents = [];
        if (groupId) {
          const grRes = await fetchAPI(`${BASE}/api/groups/one/students/${groupId}`);
          if (grRes.success) groupStudents = grRes.data?.students ?? grRes.data ?? [];
        }
        setTabData(buildTabData(answers, groupStudents));
      }
    } catch { setError("Ma'lumot yuklashda xatolik"); }
    finally { setLoading(false); }
  }, [homeworkId, groupId, role]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteAnswer = async () => {
    if (!studentAnswer) return;
    if (!window.confirm("Rostdan ham javobingizni o'chirmoqchimisiz?")) return;
    setLoading(true);
    try {
      const res = await fetchAPI(`${BASE}/api/homework-answer/${studentAnswer.id}`, {
        method: "DELETE"
      });
      if (res.success) {
        setStudentAnswer(null);
        setSubmitTitle("");
        setSubmitFile(null);
        load();
      } else {
        alert(res.message || "O'chirishda xatolik yuz berdi");
      }
    } catch {
      alert("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!submitTitle.trim()) {
      alert("Izoh kiriting");
      return;
    }
    setSubmitting(true);
    try {
      const token = getToken();
      const body = new FormData();
      body.append("homework_id", Number(homeworkId));
      body.append("title", submitTitle);
      if (submitFile) {
        body.append("file", submitFile);
      }

      const res = await fetch(`${BASE}/api/homework-answer/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body
      }).then(r => r.json());

      if (res.success) {
        load();
      } else {
        alert(res.message || "Yuklashda xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const counts = { waiting: tabData.waiting.length, returned: tabData.returned.length, accepted: tabData.accepted.length, missed: tabData.missed.length };
  const rows      = tabData[activeTab] ?? [];
  const showScore = activeTab === "returned" || activeTab === "accepted";
  const canGrade  = activeTab !== "missed";

  if (role === "student") {
    const result = studentAnswer?.homeworkResults?.[0];
    let statusLabel = "Topshirilmagan";
    let statusClass = "text-red-600 bg-red-50 border-red-200";
    if (studentAnswer) {
      if (result?.grade === null || result?.grade === undefined) {
        statusLabel = "Kutilmoqda";
        statusClass = "text-amber-600 bg-amber-50 border-amber-200";
      } else if (result.grade >= 60) {
        statusLabel = "Qabul qilindi";
        statusClass = "text-green-600 bg-green-50 border-green-200";
      } else {
        statusLabel = "Qaytarildi";
        statusClass = "text-red-600 bg-red-50 border-red-200";
      }
    }

    return (
      <div className="min-h-screen bg-[#f4f5f7]">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate">
            {loading ? "Yuklanmoqda..." : (homework?.title ?? "Uyga vazifa")}
          </h1>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
          {/* 1. Video Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {homework?.file ? (
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={`${BASE}/uploads/files/${homework.file}`}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Video mavjud emas</p>
              </div>
            )}
            <div className="px-5 py-4 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-600">({homework?.file || "fayl yo'q"})</p>
            </div>
          </div>

          {/* 2. Homework Content / Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[200px]">
             <div className="px-6 pt-4 border-b border-gray-100">
               <div className="flex gap-6">
                 <button className="pb-3 text-sm font-bold text-[#b48d5e] border-b-2 border-[#b48d5e]">
                   Vazifalar
                 </button>
               </div>
             </div>
             <div className="p-6">
               {homework?.title ? (
                 <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                   {homework.title.split('\n').map((line, i) => (
                     <p key={i}>{line}</p>
                   ))}
                   {/* If there's a more detailed description field, use it here */}
                 </div>
               ) : (
                 <p className="text-center text-gray-400 py-10">Uyga vazifa berilmagan</p>
               )}
               
               <div className="mt-8 flex justify-end text-[10px] text-gray-400">
                  {homework?.created_at && formatDateTime(homework.created_at)}
               </div>
             </div>
          </div>

          {/* 3. Feedback / Submission Section */}
          {studentAnswer && (
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Siz yuborgan javob</h4>
                  {(!result || result.grade === null) && (
                    <button onClick={handleDeleteAnswer} className="text-[10px] text-red-500 hover:underline">Javobni o'chirish</button>
                  )}
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-gray-700">{studentAnswer.title}</p>
                  {studentAnswer.file && (
                    <a href={`${BASE}/uploads/files/${studentAnswer.file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-xs text-blue-600 font-medium hover:underline">
                      <FileText size={14} /> {studentAnswer.file}
                    </a>
                  )}
                </div>

                {result && (
                  <div className={`mt-4 p-4 rounded-xl border ${result.grade >= 60 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-gray-500 uppercase">O'qituvchi bahosi:</span>
                       <span className={`text-sm font-bold ${result.grade >= 60 ? "text-green-600" : "text-red-600"}`}>{result.grade} ball</span>
                    </div>
                    {result.title && <p className="text-xs text-gray-600 italic">"{result.title}"</p>}
                  </div>
                )}
             </div>
          )}

          {/* 4. Chat-style Submission Input (Only if not accepted or no answer yet) */}
          {(!studentAnswer || (result && result.grade < 60)) && (
            <div className="mt-4">
               <form 
                 onSubmit={handleSubmitAnswer}
                 className="bg-white border border-gray-200 rounded-lg p-5 relative min-h-[140px]"
               >
                  <div className="flex gap-4">
                    <textarea
                      rows={3}
                      placeholder="Fayl biriktiring va izoh qoldiring"
                      value={submitTitle}
                      onChange={(e) => setSubmitTitle(e.target.value)}
                      className="flex-1 border-none text-base outline-none focus:ring-0 placeholder:text-gray-300 resize-none bg-transparent"
                    />
                    
                    <div className="flex items-center gap-4 h-fit pt-1">
                       <button
                         type="button"
                         onClick={() => document.getElementById("homework-file")?.click()}
                         className="text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                       </button>
                       <button 
                         type="submit"
                         disabled={submitting || !submitTitle.trim()}
                         className={`transition-all ${submitTitle.trim() ? "text-gray-600" : "text-gray-300"}`}
                       >
                         {submitting ? (
                           <Loader2 size={24} className="animate-spin" />
                         ) : (
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                         )}
                       </button>
                    </div>
                  </div>

                  <div className="absolute left-5 bottom-4">
                    {submitFile && (
                      <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                        📁 {submitFile.name}
                        <button type="button" onClick={() => setSubmitFile(null)} className="ml-1 text-red-500 font-bold">×</button>
                      </span>
                    )}
                    <input id="homework-file" type="file" className="hidden" onChange={(e) => setSubmitFile(e.target.files?.[0])} />
                  </div>

                  <div className="absolute right-5 bottom-4 text-sm text-gray-500">
                    {submitTitle.length} / 1000
                  </div>
               </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate">
            {loading ? "Yuklanmoqda..." : (homework?.title ?? "Uyga vazifa")}
          </h1>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
          {homework && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Mavzu</span>
                <span className="text-sm font-semibold text-gray-800">{homework.title}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab row */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-1">
              {TABS.map(({ key, label, bg, line }) => {
                const count = counts[key]; const isActive = activeTab === key;
                return (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? "text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                    {label}
                    {count > 0 && (
                      <span className={`${isActive ? bg : "bg-gray-200"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none transition-colors`}>
                        {count}
                      </span>
                    )}
                    {isActive && <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${line} rounded-full`} />}
                  </button>
                );
              })}
            </div>

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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">O'quvchi ismi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
                      {activeTab === "missed" ? "" : "Uyga vazifa jo'natilgan vaqt"}
                    </th>
                    {showScore && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Ball</th>}
                    {canGrade  && <th className="px-6 py-3 w-36" />}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((student) => (
                    <StudentRow key={student.answerId ?? student.student_id}
                      student={student} activeTab={activeTab} onGradeClick={setGradeStudent} />
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
          onSaved={() => { load(); setGradeStudent(null); }}
        />
      )}
    </>
  );
}