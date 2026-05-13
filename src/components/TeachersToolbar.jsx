import { Download, Trash2 } from "lucide-react";

export default function TeachersToolbar({ onExport, onDelete }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white">
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download size={13} />
        Export
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  );
}