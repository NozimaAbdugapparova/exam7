import { useAuth } from "../contexts/AuthContext";
import { Bell, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  
  const displayName = user?.name || "Foydalanuvchi";
  const displayRole = role ? role.toUpperCase() : "MEHMON";
  const initials = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="flex items-center justify-end px-6 py-4 bg-white border-b border-gray-100 ">
      

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-100" />

        {/* User Avatar + Info */}
        <div className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#3d5af1] flex items-center justify-center text-white text-sm font-semibold select-none">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-gray-400">{displayRole}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-100" />

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Tizimdan chiqish"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}