import { useState } from "react";
import { Search, SlidersHorizontal, Download, Plus, Archive } from "lucide-react";
import TeachersTable from "../components/TeachersTable";
import TeachersToolbar from "../components/TeachersToolbar";
import Pagination from "../components/Pagination";

// Mock data – replace with real API calls
const generateTeachers = (count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: "Qwerty qwert",
    avatar: `https://i.pravatar.cc/32?img=${i + 1}`,
    labels: i % 3 === 0
      ? ["Label", "Label", "Label", "LabelLabel"]
      : i % 2 === 0
      ? ["Label", "Label"]
      : ["Label"],
    phone: "+998(33)4082808",
    birthday: "24 Jan 2022",
    createdAt: "24 Jan 2022",
    coin: 123123,
  }));

const MOCK_TEACHERS = generateTeachers(10);

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = MOCK_TEACHERS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">O'qituvchilar</h1>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xl leading-relaxed">
              Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz.
              Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={13} />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
              <Plus size={13} />
              O'qituvchi qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 mb-3 flex items-center justify-between gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <SlidersHorizontal size={13} />
          Filters
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Archive size={13} />
            Arxiv
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="mx-4 flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <TeachersToolbar
          onExport={() => console.log("export")}
          onDelete={() => console.log("delete")}
        />
        <div className="flex-1 overflow-auto">
          <TeachersTable teachers={filtered} />
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="h-4" />
    </div>
  );
}