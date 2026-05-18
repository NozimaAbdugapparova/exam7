import { useState } from "react";
import { Eye, Trash2, Pencil, Minus, Plus } from "lucide-react";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
    "#f97316", "#84cc16",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, fullName, firstName, lastName }) {
  const [imgError, setImgError] = useState(false);

  const initials =
    (firstName?.[0] || "").toUpperCase() +
    (lastName?.[0] || "").toUpperCase();

  if (!src || imgError) {
    return (
      <div
        style={{ backgroundColor: stringToColor(fullName) }}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
      >
        <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={fullName}
      onError={() => setImgError(true)}
      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
    />
  );
}

export default function TeacherRow({ teacher, photoBaseUrl, selected, onSelect }) {
  const fullName = `${teacher.first_name} ${teacher.last_name}`;
  const avatarSrc = teacher.photo ? `${photoBaseUrl}${teacher.photo}` : null;

  return (
    <tr className={`border-b border-gray-100 transition-colors ${selected ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}>

      {/* Checkbox */}
      <td className="px-3 py-2.5 w-9">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
        />
      </td>

      {/* Rasm */}
      <td className="px-3 py-2.5 w-12">
        <Avatar
          src={avatarSrc}
          fullName={fullName}
          firstName={teacher.first_name}
          lastName={teacher.last_name}
        />
      </td>

      {/* Ism Familiyasi */}
      <td className="px-3 py-2.5">
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{fullName}</span>
      </td>

      {/* Email */}
      <td className="px-3 py-2.5 text-xs text-gray-500">{teacher.email || "—"}</td>

      {/* Phone */}
      <td className="px-3 py-2.5 text-xs text-gray-500">{teacher.phone || "—"}</td>

      {/* Address */}
      <td className="px-3 py-2.5 text-xs text-gray-500">{teacher.address || "—"}</td>

      {/* Actions */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-0.5">
          <button className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Kamaytirish">
            <Minus size={12} />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Ko'paytirish">
            <Plus size={12} />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Ko'rish">
            <Eye size={13} />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="O'chirish">
            <Trash2 size={13} />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="Tahrirlash">
            <Pencil size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}