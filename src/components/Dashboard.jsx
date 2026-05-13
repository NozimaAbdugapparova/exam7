import { Users, BookOpen, GraduationCap } from "lucide-react";
import { PiChalkboardTeacher } from "react-icons/pi";

const stats = [
  {
    label: "Guruhlar",
    value: 0,
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-[#3d5af1]",
  },
  {
    label: "Kurslar",
    value: 1,
    icon: BookOpen,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    label: "Talabalar",
    value: 0,
    icon: GraduationCap,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    label: "O'qituvchilar",
    value: 0,
    icon: PiChalkboardTeacher,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
  },
];

const tableHeaders = ["Vaqt", "Sinflar", "Fanlar", "O'qituvchi", "Holat"];

export default function Dashboard() {
  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dars Jadvali Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-800">Dars Jadvali</h2>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 px-6 py-3 bg-[#f7f8fd]">
          {tableHeaders.map((header) => (
            <span
              key={header}
              className="text-xs font-semibold text-[#3d5af1] uppercase tracking-wide"
            >
              {header}
            </span>
          ))}
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-gray-400">Hozircha darslar mavjud emas</p>
        </div>
      </div>
    </div>
  );
}