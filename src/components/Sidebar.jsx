import { useState } from "react";
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  User,
  ChevronDown,
  Video,
  CreditCard,
  BarChart3,
  Signal,
  ShoppingCart,
  Radio
} from "lucide-react";
import { PiChalkboardTeacher } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";

const navItems = [
  { icon: Home,          label: "Asosiy",      path: "/dashboard" },
  { icon: PiChalkboardTeacher, label: "O'qituvchilar", path: "/teachers"  },
  { 
    icon: Users,         
    label: "Guruhlar",    
    path: "/groups", 
    hasDropdown: true,
    subItems: [
      { label: "Guruhlar", path: "/groups" },
      { label: "Yig'ilayotgan guruhlar", path: "/groups/planned" }
    ]
  },
  { icon: GraduationCap,         label: "Talabalar",   path: "/students" },
  
  // Student specific items (labels will be handled in filter/mapping if needed, or just add them here)
  { icon: CreditCard,     label: "To'lovlarim",    path: "/payments" },
  { icon: BarChart3,      label: "Ko'rsatkichlarim", path: "/stats" },
  { icon: Signal,         label: "Reyting",        path: "/rating" },
  { icon: ShoppingCart,   label: "Do'kon",         path: "/shop" },
  { icon: Radio,          label: "Qo'shimcha darslar", path: "/extra-lessons" },

  { icon: Settings,       label: "Boshqarish",   path: "/control"},
  { icon: User,          label: "Profil",      path: "/profile" },
];

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { role } = useAuth();
  
  const collapsed = isCollapsed;
  const onToggle = toggleSidebar;

  const [openDropdown, setOpenDropdown] = useState(null);

  const handleItemClick = (item) => {
    if (item.hasDropdown) {
      setOpenDropdown(openDropdown === item.path ? null : item.path);
    } else {
      navigate(item.path);
    }
  };

  const filteredNavItems = navItems.filter((item) => {
    if (role === "teacher") {
      return item.path === "/groups" || item.path === "/profile";
    }
    if (role === "student") {
      // Student specific list
      const studentPaths = [
        "/dashboard", 
        "/payments", 
        "/groups", 
        "/stats", 
        "/rating", 
        "/shop", 
        "/extra-lessons", 
        "/profile"
      ];
      return studentPaths.includes(item.path);
    }
    // Admin sees everything except student-only paths
    const studentOnly = ["/payments", "/stats", "/rating", "/shop", "/extra-lessons"];
    return !studentOnly.includes(item.path);
  });

  // Rename labels for student if needed
  const processedNavItems = filteredNavItems.map(item => {
    if (role === "student") {
      if (item.path === "/dashboard") return { ...item, label: "Bosh sahifa" };
      if (item.path === "/groups")    return { ...item, label: "Guruhlarim", hasDropdown: false, subItems: undefined };
      if (item.path === "/profile")   return { ...item, label: "Sozlamalar", icon: Settings };
    }
    return item;
  });

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        flex flex-col
        bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out
        h-screen
        ${collapsed ? "w-[72px]" : "w-[250px]"}
      `}
    >
      {/* ── Logo — qotib turadi ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eef1fb] shrink-0">
          <BookOpen className="w-4 h-4 text-[#3d5af1]" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[15px] text-gray-800 tracking-tight whitespace-nowrap">
            GoldCRM
          </span>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[52px] z-10 w-6 h-6 rounded-full bg-[#3d5af1] flex items-center justify-center shadow-md hover:bg-[#2a47d6] transition-colors"
      >
        <ChevronLeft
          className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Scroll bo'ladigan qism (nav + subscription) ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        {/* Nav Items */}
        <nav className="px-3 py-4 flex flex-col gap-1">
          {processedNavItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <div key={item.path}>
                <button
                  onClick={() => handleItemClick(item)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${isActive
                      ? "bg-[#3d5af1] text-white shadow-sm shadow-[#3d5af1]/30"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }
                    ${collapsed ? "justify-center" : "justify-between"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon style={{ width: 18, height: 18 }} className="shrink-0" />
                    {!collapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>

                  {!collapsed && item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.path ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub Items */}
                {!collapsed && item.subItems && openDropdown === item.path && (
                  <div className="mt-1 flex flex-col gap-1 pl-11">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={`
                            text-left py-2 px-3 rounded-xl text-[13px] transition-all
                            ${isSubActive 
                              ? "bg-gray-100 text-[#3d5af1] font-semibold" 
                              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                            }
                          `}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Subscription Card ── */}
        {!collapsed && (
          <div className="mx-3 mb-4 mt-auto p-4 rounded-2xl border border-orange-100 bg-orange-50/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">Obuna</span>
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xs text-gray-500 mb-3">Obunangiz tugagan</p>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Qolgan kunlar</span>
              <span className="font-semibold">
                <span className="text-[#3d5af1]">5</span>
                <span className="text-gray-400"> / 30</span>
              </span>
            </div>

            <div className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
              <div className="h-1.5 bg-[#3d5af1] rounded-full" style={{ width: "16.6%" }} />
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-[#3d5af1] hover:bg-[#2a47d6] text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Obunani yangilash
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
              Obuna muddati tugashiga 5 kun qoldi
            </p>
          </div>
        )}

      </div>
    </aside>
  );
}