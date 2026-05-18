import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, X, Plus, BarChart2 } from "lucide-react";
const BASE = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
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

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
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
      <div style={{ backgroundColor: stringToColor(firstName + lastName) }}
        className={`${cls} rounded-full flex items-center justify-center shrink-0 shadow-sm`}>
        <span className="font-bold text-white leading-none">{initials}</span>
      </div>
    );
  }
  return (
    <img src={src} alt={initials} onError={() => setErr(true)}
      className={`${cls} rounded-full object-cover shrink-0 border border-gray-200`} />
  );
}

/* ── MENTORS CARD ── */
function MentorsCard({ teachers }) {
  const [open, setOpen]           = useState(true);
  const [academicsOpen, setAcademicsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-3 bg-blue-500">
        <h3 className="text-sm font-bold text-white">Guruh mentorlari</h3>
        <button onClick={() => setOpen(p => !p)} className="text-white/70 hover:text-white">
          {open ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {open && (
        <>
          <div className="px-5 py-4 flex flex-wrap gap-6">
            {teachers.length > 0 ? teachers.map((t, i) => (
              <div key={t.id || i} className="flex flex-col items-center gap-2">
                <Avatar firstName={t.first_name} lastName={t.last_name} photo={t.photo} size="lg" />
                <div className="text-center">
                  <p className="text-[10px] text-green-500 font-semibold">{i === 0 ? "Teacher" : "Assistant"}</p>
                  <p className="text-xs font-semibold text-gray-700">{t.first_name} {t.last_name}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400 italic">O'qituvchi biriktirilmagan</p>
            )}
          </div>

          <button
            onClick={() => setAcademicsOpen(p => !p)}
            className="w-full border-t border-gray-100 px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-700">Akademiklar va ularning o'qitgan soatlari</span>
            <Plus size={15} className={`text-gray-400 transition-transform ${academicsOpen ? "rotate-45" : ""}`} />
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

  const weekDays = group?.week_day?.map(d =>
    ({ MONDAY:"Du", TUESDAY:"Se", WEDNESDAY:"Ch", THURSDAY:"Pa", FRIDAY:"Ju", SATURDAY:"Sha", SUNDAY:"Ya" }[d] || d)
  ).join(", ") || "—";

  const startDate = group?.start_date ? new Date(group.start_date).toLocaleDateString("ru") : "—";

  // Bir oyda nechta dars: hafta kunlari soni * 4 hafta
  const daysPerWeek = group?.week_day?.length || 0;
  const lessonsPerMonth = daysPerWeek * 4;

  // Nechi oy davom etishi (API dan keladi)
  const durationMonths = group?.courses?.duration_month ?? null;

  // Jami darslar soni
  const totalLessons = durationMonths ? lessonsPerMonth * durationMonths : null;

  const rows = [
    { label: "Guruh nomi",        value: group?.name },
    { label: "Kurs",              value: group?.courses?.name },
    { label: "Xona",              value: group?.rooms?.name },
    { label: "Dars vaqti",        value: group?.start_time },
    { label: "Hafta kunlari",     value: weekDays },
    { label: "Boshlanish sanasi", value: startDate },
    { label: "Max talabalar",     value: group?.max_student },
    { label: "Bir oyda darslar",  value: lessonsPerMonth > 0 ? `${lessonsPerMonth} ta` : null },
    { label: "Davomiyligi (oy)",  value: durationMonths ? `${durationMonths} oy` : null },
    { label: "Jami darslar",      value: totalLessons ? `${totalLessons} ta` : null },
  ].filter(r => r.value !== null && r.value !== undefined && r.value !== "" && r.value !== "—");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-3 bg-blue-500">
        <h3 className="text-sm font-bold text-white">Parametrlar</h3>
        <button onClick={() => setOpen(p => !p)} className="text-white/70 hover:text-white">
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
  const [showAll, setShowAll]       = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = group?.week_day?.map((d) => WEEK_SHORT[d] || d).join("/") || "—";
  const teacherName = group?.teachers
    ? `${group.teachers.last_name} ${group.teachers.first_name}`
    : "—";
  const startDate = formatDate(group?.start_date);
  const endDate   = formatDate(group?.end_date);
  const startTime = group?.start_time || "—";
  const roomName  = group?.rooms?.name || "—";

  const rows = [
    { name: teacherName, days: weekDays, time: `${startTime} dan`, dates: `${startDate} - ${endDate}`, room: roomName },
  ];
  const visible = showAll ? rows : rows.slice(0, 2);

  // Calendar
  const today = new Date();
  const startOfRange = new Date(today);
  startOfRange.setDate(today.getDate() + weekOffset * 7);
  const calDays = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(startOfRange);
    d.setDate(startOfRange.getDate() + i);
    return d;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Dars jadvali</h3>

      <div className="space-y-0 mb-2">
        {visible.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 items-center">
            <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">{row.name}</span>
            <span className="text-xs text-gray-500">{row.days}</span>
            <span className="text-xs text-gray-500">{row.time}</span>
            <span className="text-xs text-gray-500">{row.dates}</span>
          </div>
        ))}
      </div>

      {rows.length > 2 && (
        <button onClick={() => setShowAll((p) => !p)}
          className="block mx-auto text-xs text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 my-3">
          {showAll ? "Kamroq ko'rsatish" : `Yana ko'rsatish (${rows.length - 2})`}
        </button>
      )}

      {/* Mini calendar */}
      <div className="mt-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setWeekOffset((p) => p - 1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold">
            ‹
          </button>
          <span className="text-xs font-semibold text-gray-700">
            {weekOffset + 7}-o'quv oyi
          </span>
          <button onClick={() => setWeekOffset((p) => p + 1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 text-xs font-bold">
            ›
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {calDays.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i}
                onClick={() => navigate(`/groups/${groupId}/lessons`)}
                className={`flex flex-col items-center px-2 py-1.5 rounded-lg min-w-[44px] cursor-pointer transition-colors
                  ${isToday ? "bg-blue-500" : "bg-gray-50 hover:bg-gray-100"}`}>
                <span className={`text-[9px] font-medium ${isToday ? "text-blue-100" : "text-gray-400"}`}>
                  {CAL_MONTHS[d.getMonth()]}
                </span>
                <span className={`text-sm font-bold ${isToday ? "text-white" : "text-gray-700"}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <button className="block mx-auto mt-3 text-xs text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50">
          Barchasini ko'rish
        </button>
      </div>
    </div>
  );
}

/* ── TABS ── */
const TABS = ["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"];

/* ── MAIN ── */
export default function GroupDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [group, setGroup]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAPI(`${BASE}/api/groups/${id}`)
      .then((j) => { if (j.success) setGroup(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const teachers = group?.teachers ? [group.teachers] : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-white border border-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-base font-bold text-gray-800">{group?.name || "Guruh"}</h1>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 rounded-full border border-green-200">
          Aktiv
        </span>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 shadow-sm">
          <BarChart2 size={13} />Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-gray-200 flex gap-1">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-xs text-gray-400">Guruh darsliklari bo'limi</p>
            </div>
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