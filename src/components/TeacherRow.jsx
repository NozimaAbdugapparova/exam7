import { Eye, Download, Trash2, Pencil, Minus, Plus } from "lucide-react";

export default function TeacherRow({ teacher, selected, onSelect }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors group">
      {/* Checkbox */}
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
        />
      </td>

      {/* Name */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <span className="text-xs font-medium text-gray-800">{teacher.name}</span>
        </div>
      </td>

      {/* Groups / Labels */}
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {teacher.labels.slice(0, 3).map((label, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded border border-gray-200 leading-none"
            >
              {label}
            </span>
          ))}
          {teacher.labels.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-400 rounded border border-gray-200 leading-none">
              +{teacher.labels.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Phone */}
      <td className="px-3 py-2 text-xs text-gray-500">{teacher.phone}</td>

      {/* Birthday */}
      <td className="px-3 py-2 text-xs text-gray-500">{teacher.birthday}</td>

      {/* Created */}
      <td className="px-3 py-2 text-xs text-gray-500">{teacher.createdAt}</td>


      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Decrease">
            <Minus size={12} />
          </button>
          <button className="p-1 text-gray-500 hover:text-green-500 transition-colors" title="Increase">
            <Plus size={12} />
          </button>
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors" title="View">
            <Eye size={13} />
          </button>
          <button className="p-1 text-gray-500 hover:text-purple-500 transition-colors" title="Download">
            <Download size={13} />
          </button>
          <button className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
          <button className="p-1 text-gray-500 hover:text-indigo-500 transition-colors" title="Edit">
            <Pencil size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}