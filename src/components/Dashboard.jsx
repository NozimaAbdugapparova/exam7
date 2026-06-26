import { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { PiChalkboardTeacher } from "react-icons/pi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

export default function Dashboard() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const [data,    setData]    = useState({ groups: 0, courses: 0, students: 0, teachers: 0 });
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const displayName = user?.name || "Foydalanuvchi";
  const displayRole = role === "admin" ? "Administrator" : role === "teacher" ? "O'qituvchi" : "Talaba";

  useEffect(() => {
    const token = getToken();
    setLoading(true);
    setError(null);

    if (role === "admin") {
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
    } else if (role === "teacher" && user?.id) {
      fetch(`${BASE}/api/teachers/all/groups/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setUserGroups(json.data || []);
            setData({ groups: (json.data || []).length, students: 0 });
          } else throw new Error("Guruhlarni yuklashda xatolik");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (role === "student") {
      fetch(`${BASE}/api/students/own/groups`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setUserGroups(json.data || []);
            setData({ groups: (json.data || []).length });
          } else throw new Error("Guruhlaringizni yuklashda xatolik");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [role, user?.id]);

  return (
    <div className="p-6 flex flex-col gap-6 bg-gray-50/50 min-h-screen">
      {/* Greeting */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            Salom, {displayName}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            GoldCRM platformasiga xush kelibsiz! Siz tizimga <span className="font-semibold text-[#3d5af1]">{displayRole}</span> sifatida kirdingiz.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {role === "admin" ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div>
              <p className="text-sm text-gray-400 mb-1">Faol Guruhlarim</p>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                ) : (
                  data.groups ?? 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#3d5af1]" />
            </div>
          </div>

          {role === "teacher" && (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div>
                <p className="text-sm text-gray-400 mb-1">Roli</p>
                <p className="text-2xl font-bold text-gray-800">O'qituvchi</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <PiChalkboardTeacher className="w-6 h-6 text-violet-500" />
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div>
                <p className="text-sm text-gray-400 mb-1">Roli</p>
                <p className="text-2xl font-bold text-gray-800">Talaba</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Section */}
      {role === "admin" ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mening Guruhlarim</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-[#3d5af1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Sizga biriktirilgan guruhlar topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    if (role === "student") {
                      navigate(`/groups/${group.id}/lessons`);
                    } else {
                      navigate(`/groups/${group.id}`);
                    }
                  }}
                  className="p-5 border border-gray-100 hover:border-blue-200 bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 text-base group-hover:text-[#3d5af1] transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {group.courses?.name || "Kurs aniqlanmagan"} • {group.rooms?.name || "Xona yo'q"}
                    </p>
                    {group.start_time && (
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        Dars vaqti: {group.start_time}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#3d5af1] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}