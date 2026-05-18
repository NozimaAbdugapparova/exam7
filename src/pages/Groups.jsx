import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, GraduationCap, RefreshCw, Loader2, Archive, Plus } from "lucide-react";
import AddGroupDrawer from "../components/AddGroupDrawer";

const API_URL = "http://localhost:3000/api/groups/all";

const WEEK_DAY_SHORT = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Chor",
  THURSDAY: "Pay",
  FRIDAY: "Ju",
  SATURDAY: "Sha",
  SUNDAY: "Ya",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

function StatCard({ icon: Icon, label, value, avatars }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon size={18} className="text-gray-400" />
        </div>
        <button className="text-gray-300 hover:text-gray-400">
          <RefreshCw size={14} />
        </button>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {avatars && (
        <div className="flex -space-x-2">
          {avatars.slice(0, 3).map((a, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-700">
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeekDays({ days }) {
  return (
    <span className="text-xs text-gray-500">
      {days.map((d) => WEEK_DAY_SHORT[d] || d).join(", ")}
    </span>
  );
}

function TeacherInitials({ firstName, lastName }) {
  const letter = (firstName?.[0] || "").toUpperCase();
  const colors = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700"];
  const color = colors[(firstName?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${color}`}>
        {letter}
      </div>
      <span className="text-xs text-gray-600 whitespace-nowrap">
        {firstName} {lastName?.[0]}.
      </span>
    </div>
  );
}

function StatusToggle({ active }) {
  const [on, setOn] = useState(active);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setOn((p) => !p)}
        className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-blue-500" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className={`text-[10px] font-bold ${on ? "text-blue-500" : "text-gray-400"}`}>
        {on ? "ACTIVE" : "INACTIVE"}
      </span>
    </div>
  );
}

function GroupRow({ group }) {
  const navigate = useNavigate();
  const startDate = group.start_date ? new Date(group.start_date) : null;
  const formatDate = (d) => d ? `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}` : "—";

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      {/* Status */}
      <td className="px-4 py-3">
        <StatusToggle active={true} />
      </td>

      {/* Guruh nomi */}
      <td className="px-4 py-3">
        <span
          onClick={() => navigate(`/groups/${group.id}`)}
          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          {group.name}
        </span>
      </td>

      {/* Kurs */}
      <td className="px-4 py-3">
        {group.courses ? (
          <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-medium">
            {group.courses.name}
          </span>
        ) : "—"}
      </td>

      {/* Davomiyligi */}
      <td className="px-4 py-3">
        <div className="text-xs text-gray-500 leading-relaxed">
          <div className="font-medium text-gray-700">{group.max_student * 9} minut</div>
          <div>{formatDate(startDate)} –</div>
          <div>{group.end_date ? formatDate(new Date(group.end_date)) : "..."}</div>
        </div>
      </td>

      {/* Dars vaqti */}
      <td className="px-4 py-3">
        <div className="text-xs text-gray-700 font-medium">{group.start_time || "—"}</div>
        {group.week_day?.length > 0 && <WeekDays days={group.week_day} />}
      </td>

      {/* Xona */}
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600">{group.rooms?.name || "—"}</span>
      </td>

      {/* O'qituvchi */}
      <td className="px-4 py-3">
        {group.teachers ? (
          <TeacherInitials firstName={group.teachers.first_name} lastName={group.teachers.last_name} />
        ) : (
          <span className="text-xs text-gray-400 italic">O'qituvchi yo'q</span>
        )}
      </td>

      {/* Talabalar */}
      <td className="px-4 py-3">
        <span className="text-xs font-semibold text-gray-700">{group.student_count ?? 0}</span>
      </td>

      {/* More */}
      <td className="px-4 py-3">
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="14" cy="8" r="1.5"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

const COLUMNS = [
  "Status", "Guruh", "Kurs", "Davomiyligi",
  "Dars vaqti", "Xona", "O'qituvchi", "Talabalar", ""
];

export default function Groups() {
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState("guruhlar");
  const [refetch, setRefetch]   = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.status === 401) throw new Error("Tizimga kirish talab qilinadi");
        if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error("Ma'lumot olishda xatolik");
        setGroups(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [refetch]);

  const teacherCount = new Set(groups.filter(g => g.teachers).map(g => g.teachers.id)).size;
  const studentCount = groups.reduce((sum, g) => sum + (g.student_count ?? 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] min-h-screen">

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Guruhlar</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={13} />
          Guruh qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4 flex items-center gap-1 border-b border-gray-200">
        {["guruhlar", "arxiv"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "arxiv" && <Archive size={12} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="px-5 mb-4 flex gap-4">
        <StatCard icon={Users} label="Jami guruhlar" value={groups.length} />
        <StatCard icon={BookOpen} label="O'qituvchilar" value={teacherCount} />
        <StatCard
          icon={GraduationCap}
          label="O'quvchilar"
          value={studentCount}
          avatars={["A", "B"]}
        />
      </div>

      {/* Table */}
      <div className="mx-5 flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Table header toolbar */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-end">
          <button
            onClick={() => setRefetch(n => n + 1)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Yangilash"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-xs text-red-500 font-medium">{error}</span>
            <button onClick={() => setRefetch(n => n + 1)} className="text-xs text-blue-600 underline">Qayta urinish</button>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <span className="text-xs text-gray-400">Guruhlar topilmadi</span>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {COLUMNS.map((col, i) => (
                    <th key={i} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {groups.map((group) => (
                  <GroupRow key={group.id} group={group} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="h-5" />

      <AddGroupDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { setRefetch(n => n + 1); }}
      />
    </div>
  );
}