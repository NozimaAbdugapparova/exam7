import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, User, Clock, CheckCircle, MoreVertical, Loader2 } from "lucide-react";

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
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <MoreVertical size={14} />
                </button>
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

  const [activeSubTab, setActiveSubTab] = useState("Uyga vazifa");
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    setError(null);

    fetchAPI(`${BASE}/api/homework/all?groupId=${groupId}`)
      .then((j) => {
        if (j.success) setLessons(j.data ?? []);
        else setError("Ma'lumot olishda xatolik");
      })
      .catch(() => setError("Server bilan bog'lanishda xatolik"))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleRowClick = (homeworkId) => {
    navigate(`/groups/${groupId}/homework/${homeworkId}`);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Sub-tabs + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-800 mr-4">Guruh darsliklari</span>
          {SUB_TABS.map((tab) => (
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

        {activeSubTab === "Uyga vazifa" && (
          <button
            onClick={() => navigate(`/homework/add/${groupId}`)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
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
        ) : (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-gray-400">{activeSubTab} bo'limi</p>
          </div>
        )}
      </div>

    </div>
  );
}