import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, X, Plus, BarChart2 } from "lucide-react";
import GroupLessons from "../components/GroupLessons";

const BASE = "http://localhost:3000";

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

const WEEK_SHORT = {
  MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Ch",
  THURSDAY: "Pa", FRIDAY: "Ju", SATURDAY: "Sha", SUNDAY: "Ya",
};

const MONTHS     = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
const CAL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ firstName = "", lastName = "", photo, size = "md" }) {
  const [err, setErr] = useState(false);
  const initials = (firstName[0] || "").toUpperCase() + (lastName[0] || "").toUpperCase();
  const src = photo ? `${BASE}/uploads/${photo}` : null;
  const cls = size === "lg" ? "w-16 h-16 text-lg" : "w-10 h-10 text-sm";

  if (!src || err) {
    return (
      <div
        style={{ backgroundColor: stringToColor(firstName + lastName) }}
        className={`${cls} rounded-full flex items-center justify-center shrink-0 shadow-sm`}
      >
        <span className="font-bold text-white leading-none">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={initials}
      onError={() => setErr(true)}
      className={`${cls} rounded-full object-cover shrink-0 border border-gray-200`}
    />
  );
}

/* ── MENTORS CARD ── */
function MentorsCard({ teachers }) {
  const [open, setOpen]               = useState(true);
  const [academicsOpen, setAcademicsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-3 bg-blue-500">
        <h3 className="text-sm font-bold text-white">Guruh mentorlari</h3>
        <button onClick={() => setOpen((p) => !p)} className="text-white/70 hover:text-white">
          {open ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {open && (
        <>
          <div className="px-5 py-4 flex flex-wrap gap-6">
            {teachers.length > 0 ? teachers.map((t, i) => (
              <div key={t.id ?? i} className="flex flex-col items-center gap-2">
                <Avatar firstName={t.first_name} lastName={t.last_name} photo={t.photo} size="lg" />
                <div className="text-center">
                  <p className="text-[10px] text-blue-500 font-semibold">
                    {i === 0 ? "Teacher" : "Assistant"}
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    {t.first_name} {t.last_name}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400 italic">O'qituvchi biriktirilmagan</p>
            )}
          </div>

          <button
            onClick={() => setAcademicsOpen((p) => !p)}
            className="w-full border-t border-gray-100 px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-700">
              Akademiklar va ularning o'qitgan soatlari
            </span>
            <Plus
              size={15}
              className={`text-gray-400 transition-transform ${academicsOpen ? "rotate-45" : ""}`}
            />
          </button>

          {academicsOpen && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Ma'lumot mavjud emas
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── PARAMS CARD ── */
function ParamsCard({ group }) {
  const [open, setOpen] = useState(true);

  const weekDays = group?.week_day?.map((d) =>
    ({ MONDAY:"Du", TUESDAY:"Se", WEDNESDAY:"Ch", THURSDAY:"Pa", FRIDAY:"Ju", SATURDAY:"Sha", SUNDAY:"Ya" }[d] || d)
  ).join(", ") || "—";

  const startDate = group?.start_date
    ? new Date(group.start_date).toLocaleDateString("ru")
    : "—";

  const daysPerWeek       = group?.week_day?.length || 0;
  const lessonsPerMonth   = daysPerWeek * 4;
  const durationMonths    = group?.courses?.duration_month ?? null;
  const totalLessons      = durationMonths ? lessonsPerMonth * durationMonths : null;

  const rows = [
    { label: "Guruh nomi",        value: group?.name               },
    { label: "Kurs",              value: group?.courses?.name      },
    { label: "Xona",              value: group?.rooms?.name        },
    { label: "Dars vaqti",        value: group?.start_time         },
    { label: "Hafta kunlari",     value: weekDays                  },
    { label: "Boshlanish sanasi", value: startDate                 },
    { label: "Max talabalar",     value: group?.max_student        },
    { label: "Bir oyda darslar",  value: lessonsPerMonth > 0 ? `${lessonsPerMonth} ta` : null },
    { label: "Davomiyligi (oy)",  value: durationMonths ? `${durationMonths} oy` : null       },
    { label: "Jami darslar",      value: totalLessons   ? `${totalLessons} ta`   : null       },
  ].filter((r) => r.value !== null && r.value !== undefined && r.value !== "" && r.value !== "—");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-3 bg-blue-500">
        <h3 className="text-sm font-bold text-white">Parametrlar</h3>
        <button onClick={() => setOpen((p) => !p)} className="text-white/70 hover:text-white">
          {open ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {open && (
        <div className="divide-y divide-gray-50">
          {rows.length > 0 ? rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-gray-500">{label}:</span>
              <span className="text-xs font-semibold text-gray-800">{value}</span>
            </div>
          )) : (
            <p className="px-5 py-4 text-xs text-gray-400 italic">Ma'lumot mavjud emas</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── SCHEDULE CARD ── */
function ScheduleCard({ group, groupId }) {
  const navigate = useNavigate();
  const [showAll,     setShowAll]     = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekDays       = group?.week_day?.map((d) => WEEK_SHORT[d] || d).join("/") || "—";
  const teacherName    = group?.teachers
    ? `${group.teachers.last_name} ${group.teachers.first_name}`
    : "—";
  const startTime      = group?.start_time || "—";
  const durationMonths = group?.courses?.duration_month ?? 0;
  const LESSONS_PER_MONTH = (group?.week_day?.length || 0) * 4;

  const startDate = group?.start_date ? new Date(group.start_date) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmt = (d) => (d ? formatDate(d) : "—");

  const WEEK_DAY_MAP = {
    MONDAY:1, TUESDAY:2, WEDNESDAY:3, THURSDAY:4,
    FRIDAY:5, SATURDAY:6, SUNDAY:0,
  };
  const allowedDays  = new Set((group?.week_day || []).map((d) => WEEK_DAY_MAP[d]));
  const chunkSize    = LESSONS_PER_MONTH || 20;
  const maxLessons   = durationMonths * chunkSize;

  const allLessonDays = (() => {
    if (!startDate || !maxLessons) return [];
    const days   = [];
    const cursor = new Date(startDate);
    while (days.length < maxLessons) {
      if (allowedDays.has(cursor.getDay())) days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getFullYear() > startDate.getFullYear() + 5) break;
    }
    return days;
  })();

  const endDate = allLessonDays.length > 0
    ? allLessonDays[allLessonDays.length - 1]
    : null;

  const studyMonths = [];
  for (let i = 0; i < allLessonDays.length; i += chunkSize) {
    studyMonths.push(allLessonDays.slice(i, i + chunkSize));
  }

  const currentMonthIdx = (() => {
    for (let i = 0; i < studyMonths.length; i++) {
      const last = studyMonths[i][studyMonths[i].length - 1];
      if (today <= last) return i;
    }
    return studyMonths.length - 1;
  })();

  const displayMonthIdx = Math.max(
    0,
    Math.min(studyMonths.length - 1, currentMonthIdx + monthOffset)
  );
  const displayDays = studyMonths[displayMonthIdx] || [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Dars jadvali</h3>

      <div className="py-3 border-b border-gray-100 grid grid-cols-4 gap-4 items-center">
        <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
          {teacherName}
        </span>
        <span className="text-xs text-gray-500">{weekDays}</span>
        <span className="text-xs text-gray-500">{startTime} dan</span>
        <span className="text-xs text-gray-500">{fmt(startDate)} – {fmt(endDate)}</span>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setMonthOffset((p) => p - 1)}
            disabled={displayMonthIdx === 0}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-xs font-semibold text-gray-700">
            {displayMonthIdx + 1}-o'quv oyi
          </span>
          <button
            onClick={() => setMonthOffset((p) => p + 1)}
            disabled={displayMonthIdx >= studyMonths.length - 1}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold disabled:opacity-30"
          >
            ›
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {displayDays.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            const isPast  = d < today;
            return (
              <div
                key={i}
                onClick={() => navigate(`/groups/${groupId}/lessons`)}
                className={`flex flex-col items-center px-2 py-1.5 rounded-lg min-w-[44px] cursor-pointer transition-colors
                  ${isToday ? "bg-blue-500"
                    : isPast  ? "bg-gray-100 opacity-60 hover:opacity-80"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <span className={`text-[9px] font-medium
                  ${isToday ? "text-blue-100" : "text-gray-400"}`}>
                  {CAL_MONTHS[d.getMonth()]}
                </span>
                <span className={`text-sm font-bold
                  ${isToday ? "text-white" : isPast ? "text-gray-400" : "text-gray-700"}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowAll((p) => !p)}
          className="block mx-auto mt-3 text-xs text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
        >
          {showAll ? "Yopish" : "Barchasini ko'rish"}
        </button>

        {showAll && (
          <div className="mt-5 space-y-6">
            {studyMonths.map((days, mIdx) => (
              <div key={mIdx}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-600">{mIdx + 1}-o'quv oyi</span>
                  <span className="text-[10px] text-gray-400">({days.length} ta dars)</span>
                  {mIdx === currentMonthIdx && (
                    <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      Joriy oy
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((d, i) => {
                    const isToday = d.toDateString() === today.toDateString();
                    const isPast  = d < today;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(`/groups/${groupId}/lessons`)}
                        title={`${d.getDate()} ${CAL_MONTHS[d.getMonth()]}`}
                        className={`w-10 h-10 rounded-lg text-xs font-semibold transition-colors flex flex-col items-center justify-center
                          ${isToday ? "bg-blue-500 text-white shadow-sm"
                            : isPast  ? "bg-gray-100 text-gray-400"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span className="text-[8px] leading-none opacity-70">
                          {CAL_MONTHS[d.getMonth()]}
                        </span>
                        <span className="leading-none">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TABS ── */
const TABS = ["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"];

/* ── MAIN ── */
export default function GroupDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [group,        setGroup]        = useState(null);
  const [studentCount, setStudentCount] = useState(0);   // ✅ haqiqiy o'quvchilar soni
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Guruh ma'lumotlari
    fetchAPI(`${BASE}/api/groups/${id}`)
      .then((j) => { if (j.success) setGroup(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // ✅ Haqiqiy o'quvchilar sonini alohida yuklash
    fetchAPI(`${BASE}/api/groups/one/students/${id}`)
      .then((j) => {
        if (j.success) setStudentCount(j.data?.length ?? 0);
      })
      .catch(() => {});
  }, [id]);

  const teachers = group?.teachers ? [group.teachers] : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-white border border-gray-200 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-base font-bold text-gray-800">{group?.name || "Guruh"}</h1>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 rounded-full border border-blue-200">
          Aktiv
        </span>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 shadow-sm">
          <BarChart2 size={13} /> Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-gray-200 flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
        </div>
      ) : (
        <div className="px-5 py-4">
          {activeTab === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-0 items-start">
                <MentorsCard teachers={teachers} />
                <ParamsCard group={group} />
              </div>
              <ScheduleCard group={group} groupId={id} />
            </>
          )}
          {activeTab === 1 && (
            // ✅ haqiqiy o'quvchilar soni uzatildi
            <GroupLessons groupId={id} groupStudentCount={studentCount} />
          )}
          {activeTab === 2 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-xs text-gray-400">Akademik davomati bo'limi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}