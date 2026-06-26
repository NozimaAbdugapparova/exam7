import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, User, Clock, CheckCircle, MoreVertical, Loader2, Video, ChevronDown, ChevronUp } from "lucide-react";
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

function fetchAPI(url) {
  const token = getToken();
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }).then((r) => r.json());
}

function formatDateTime(str) {
  if (!str) return null;
  const d   = new Date(str);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = UZ_MONTHS[d.getMonth()];
  const yr  = d.getFullYear();
  const hh  = String(d.getHours()).padStart(2, "0");
  const mm  = String(d.getMinutes()).padStart(2, "0");
  return { date: `${day} ${mon}, ${yr}`, time: `${hh}:${mm}` };
}

function addOneDay(str) {
  if (!str) return null;
  const d = new Date(new Date(str).getTime() + 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, "0")} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

const SUB_TABS = ["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"];

/* ── DATETIME CELL ── */
function DateTimeCell({ isoStr }) {
  if (!isoStr) return <span className="text-xs text-gray-400">—</span>;
  const { date, time } = formatDateTime(isoStr);
  return (
    <div>
      <div className="text-xs text-gray-700">{date}</div>
      <div className="text-xs text-gray-400">{time}</div>
    </div>
  );
}

/* ── LESSONS TABLE ── */
function LessonsTable({ lessons, loading, error, groupStudentCount, groupId, onRowClick }) {
  const { role: rawRole } = useAuth();
  const role = rawRole?.toLowerCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={18} className="animate-spin text-green-500" />
        <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-xs text-red-400">{error}</span>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-xs text-gray-400">Uyga vazifalar mavjud emas</span>
      </div>
    );
  }

  if (role === "student") {
    return (
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mavzular</th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Video</th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Uyga vazifa Holati</th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <div className="flex items-center gap-1">Uyga vazifa tugash vaqti <ChevronDown size={12} /></div>
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <div className="flex items-center gap-1">Dars sanasi <ChevronUp size={12} /></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => {
            const deadlineISO = addOneDay(lesson.created_at || lesson.lesson_date);
            const answer = lesson.student_answer;
            const result = answer?.homeworkResults?.[0];
            const hasVideo = lesson.file ? 1 : 0; // Temporary logic, usually we should count files

            let statusLabel = "Topshirilmagan";
            let statusClass = "text-gray-600 bg-gray-100 border-gray-200";

            if (answer) {
              const grade = result?.grade;
              if (grade === null || grade === undefined) {
                statusLabel = "Kutilayotganlar";
                statusClass = "text-blue-600 bg-blue-50 border-blue-100";
              } else {
                if (grade >= 60) {
                  statusLabel = "Qabul qilingan";
                  statusClass = "text-green-600 bg-green-50 border-green-100";
                } else {
                  statusLabel = "Qaytarilgan";
                  statusClass = "text-red-600 bg-red-50 border-red-100";
                }
              }
            } else if (!lesson.id) { // Mock or placeholder if no homework attached to lesson
                 statusLabel = "Berilmagan";
            }

            return (
              <tr
                key={lesson.id}
                onClick={() => onRowClick(lesson.id)}
                className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-4 text-sm text-gray-700 font-medium whitespace-pre-wrap">
                  {lesson.theme || lesson.title || "—"}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-blue-200 text-[#3d5af1] text-[11px] font-bold">
                    {hasVideo}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-4 py-1.5 text-xs rounded-lg font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                   {answer ? (formatDateTime(deadlineISO)?.date + " " + formatDateTime(deadlineISO)?.time) : "—"}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                   {formatDate(lesson.lesson_date || lesson.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="px-4 py-3 text-xs font-semibold text-gray-400 w-10">#</th>
          <th className="px-4 py-3 text-xs font-semibold text-gray-400">Mavzu</th>
          <th className="px-4 py-3" title="Jami talabalar">
            <User size={13} className="text-gray-400" />
          </th>
          <th className="px-4 py-3" title="Topshirilgan, tekshirilmagan">
            <Clock size={13} className="text-orange-400" />
          </th>
          <th className="px-4 py-3" title="Tekshirilgan">
            <CheckCircle size={13} className="text-green-400" />
          </th>
          <th className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap">
            Berilgan vaqt
          </th>
          <th className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap">
            Tugash vaqti
          </th>
          <th className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap">
            Dars sanasi
          </th>
          <th className="px-4 py-3 w-8" />
        </tr>
      </thead>
      <tbody>
        {lessons.map((lesson, idx) => {
          const deadlineISO = addOneDay(lesson.created_at);
          const submitted   = lesson.submitted_count ?? lesson.answer_count ?? 0;
          const checked     = lesson.checked_count   ?? lesson.reviewed_count ?? 0;
          const pending     = Math.max(submitted - checked, 0);

          return (
            <tr
              key={lesson.id}
              onClick={() => onRowClick(lesson.id)}
              className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group cursor-pointer"
            >
              <td className="px-4 py-3 text-xs text-gray-500 font-medium">{idx + 1}</td>
              <td className="px-4 py-3 text-xs text-gray-800 max-w-sm font-medium">
                {lesson.title || lesson.topic || lesson.name || "—"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                {groupStudentCount ?? "—"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 font-medium">{pending}</td>
              <td className="px-4 py-3 text-xs text-gray-600 font-medium">{checked}</td>
              <td className="px-4 py-3">
                <DateTimeCell isoStr={lesson.created_at} />
              </td>
              <td className="px-4 py-3">
                <DateTimeCell isoStr={deadlineISO} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {formatDate(lesson.lesson_date || lesson.date || lesson.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="relative group/menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle dropdown logic could go here, or just navigate for now
                      navigate(`/homework/edit/${lesson.id}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── MAIN ── */
export default function GroupLessons({ groupId, groupStudentCount }) {
  const navigate = useNavigate();


  const { role: rawRole } = useAuth();
  const role = rawRole?.toLowerCase();
  const [activeSubTab, setActiveSubTab] = useState("Uyga vazifa");
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    setError(null);

    if (role === "student") {
      Promise.all([
        fetchAPI(`${BASE}/api/lessons/my/group/${groupId}`),
        fetchAPI(`${BASE}/api/homework-answer/my`)
      ])
        .then(async ([lessJson, answersJson]) => {
          if (lessJson.success) {
            const lessonsList = lessJson.data ?? [];
            const myAnswers = answersJson.success ? (answersJson.data ?? []) : [];
            
            const homeworkPromises = lessonsList.map((lesson) =>
              fetchAPI(`${BASE}/api/homework/own/${lesson.id}`).then((res) => {
                if (res.success && res.data) {
                  return res.data.map(hw => {
                    const ans = myAnswers.find(a => a.homework?.id === hw.id || a.homework_id === hw.id);
                    return {
                      ...hw,
                      lesson_id: lesson.id,
                      lesson_theme: lesson.theme,
                      student_answer: ans || null
                    };
                  });
                }
                return [];
              })
            );
            const homeworkResults = await Promise.all(homeworkPromises);
            const allHomeworks = homeworkResults.flat();
            setLessons(allHomeworks);
          } else {
            setError("Guruh darslarini yuklashda xatolik");
          }
        })
        .catch(() => setError("Server bilan bog'lanishda xatolik"))
        .finally(() => setLoading(false));
    } else {
      fetchAPI(`${BASE}/api/homework/all?groupId=${groupId}`)
        .then((j) => {
          if (j.success) setLessons(j.data ?? []);
          else setError("Ma'lumot olishda xatolik");
        })
        .catch(() => setError("Server bilan bog'lanishda xatolik"))
        .finally(() => setLoading(false));
    }
  }, [groupId, role]);

  const handleRowClick = (homeworkId) => {
    navigate(`/groups/${groupId}/homework/${homeworkId}`);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Sub-tabs + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {role !== "student" && <span className="text-sm font-bold text-gray-800 mr-4">Guruh darsliklari</span>}
          {role?.toLowerCase() !== "student" && SUB_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors
                ${activeSubTab === tab
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeSubTab === "Uyga vazifa" && role !== "student" && (
          <button
            onClick={() => navigate(`/homework/add/${groupId}`)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={14} />
            Uyga vazifa qo'shish
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {activeSubTab === "Uyga vazifa" ? (
          <LessonsTable
            lessons={lessons}
            loading={loading}
            error={error}
            groupStudentCount={groupStudentCount}
            groupId={groupId}
            onRowClick={handleRowClick}
          />
        ) : activeSubTab === "Videolar" ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lessons.filter(l => l.file).length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 text-xs italic">
                Bu guruhda videolar mavjud emas
              </div>
            ) : (
              lessons.filter(l => l.file).map(lesson => (
                <div key={lesson.id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group">
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                    <video 
                      src={`${BASE}/uploads/files/${lesson.file}`} 
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div 
                       onClick={() => window.open(`${BASE}/uploads/files/${lesson.file}`, '_blank')}
                       className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors"
                    >
                      <Video size={30} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{lesson.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(lesson.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-gray-400">{activeSubTab} bo'limi</p>
          </div>
        )}
      </div>

    </div>
  );
}