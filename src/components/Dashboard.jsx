import { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import { PiChalkboardTeacher } from "react-icons/pi";

const BASE          = "http://localhost:3000";
const STATS_API     = `${BASE}/api/dashboard/stats`;
const tableHeaders  = ["Vaqt", "Sinflar", "Fanlar", "O'qituvchi", "Holat"];

const STAT_CONFIG = [
  { key: "groups",   label: "Guruhlar",      icon: Users,               iconBg: "bg-blue-50",   iconColor: "text-[#3d5af1]"    },
  { key: "courses",  label: "Kurslar",        icon: BookOpen,            iconBg: "bg-indigo-50", iconColor: "text-indigo-500"   },
  { key: "students", label: "Talabalar",      icon: GraduationCap,       iconBg: "bg-sky-50",    iconColor: "text-sky-500"      },
  { key: "teachers", label: "O'qituvchilar",  icon: PiChalkboardTeacher, iconBg: "bg-violet-50", iconColor: "text-violet-500"   },
];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function Dashboard({ user = { name: "Admin", role: "Admin" } }) {
  const [data,    setData]    = useState({ groups: 0, courses: 0, students: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const token = getToken();
    setLoading(true);
    setError(null);

    fetch(STATS_API, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
        else throw new Error("Ma'lumot olishda xatolik");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          Salom, {user.name}!
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          GoldCRM platformasiga xush kelibsiz!
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
          <div
            key={key}
            className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div>
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                ) : (
                  data[key] ?? 0
                )}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dars Jadvali */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-800">Dars Jadvali</h2>
        </div>
        <div className="grid grid-cols-5 px-6 py-3 bg-[#f7f8fd]">
          {tableHeaders.map((header) => (
            <span key={header} className="text-xs font-semibold text-[#3d5af1] uppercase tracking-wide">
              {header}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-gray-400">Hozircha darslar mavjud emas</p>
        </div>
      </div>
    </div>
  );
}