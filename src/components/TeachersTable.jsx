import { useState } from "react";
import TeacherRow from "./TeacherRow";

const COLUMNS = [
  { key: "name", label: "Ism familiyasi" },
  { key: "labels", label: "Guruh" },
  { key: "phone", label: "Telefon raqamlari" },
  { key: "birthday", label: "Tug'ilgan sanasi" },
  { key: "createdAt", label: "Yaratilgan sana" },
];

export default function TeachersTable({ teachers }) {
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
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-3 py-2 w-9">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
              />
            </th>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.key === "name"}
                </div>
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="bg-white">
          {teachers.map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              selected={selected.includes(teacher.id)}
              onSelect={() => toggleOne(teacher.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}