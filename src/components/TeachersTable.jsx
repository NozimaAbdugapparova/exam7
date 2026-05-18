import { useState } from "react";
import TeacherRow from "./TeacherRow";
import { ChevronDown } from "lucide-react";

const COLUMNS = [
  { key: "photo", label: "Rasm" },
  { key: "first_name", label: "Ism familiyasi" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefon raqamlari" },
  { key: "address", label: "Manzil" },
];

export default function TeachersTable({ teachers, photoBaseUrl }) {
  const [selected, setSelected] = useState([]);

  const allSelected = selected.length === teachers.length && teachers.length > 0;

  const toggleAll = () => {
    setSelected(allSelected ? [] : teachers.map((t) => t.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th className="px-3 py-2.5 w-9">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
              />
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.key === "first_name" && <ChevronDown size={11} className="text-gray-300" />}
                </div>
              </th>
            ))}
            <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Amallar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {teachers.map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              photoBaseUrl={photoBaseUrl}
              selected={selected.includes(teacher.id)}
              onSelect={() => toggleOne(teacher.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}