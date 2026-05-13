import { Bell } from "lucide-react";

export default function Navbar({ user = { name: "Nozima", role: "Admin" } }) {
  const initials = user.name?.charAt(0).toUpperCase() || "C";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 ">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          Salom, {user.name}!
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          GoldCRM platformasiga xush kelibsiz!
        </p>
      </div>

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
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-[#3d5af1] flex items-center justify-center text-white text-sm font-semibold select-none">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}