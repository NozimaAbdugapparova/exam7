import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Download, Plus, Archive, Loader2 } from "lucide-react";
import TeachersTable from "../components/TeachersTable";
import TeachersToolbar from "../components/TeachersToolbar";
import Pagination from "../components/Pagination";
import AddTeacherDrawer from "../components/AddTeacherDrawer";

const API_URL = "http://localhost:3000/api/teachers/all";
const PHOTO_BASE_URL = "http://localhost:3000/uploads/";
const PAGE_SIZE = 10;

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token")
        || localStorage.getItem("accessToken")
        || localStorage.getItem("access_token");

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.status === 401) throw new Error("Tizimga kirish talab qilinadi (401)");
      if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error("Ma'lumot olishda xatolik");
      setTeachers(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const filtered = teachers.filter((t) => {
    const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] min-h-screen">
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
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
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

        {/* States */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-purple-500" />
            <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
          </div>
        )}
        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-xs text-red-500 font-medium">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-purple-600 underline"
            >
              Qayta urinish
            </button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <span className="text-xs text-gray-400">O'qituvchilar topilmadi</span>
          </div>
        )}

        {!loading && !error && paginated.length > 0 && (
          <div className="flex-1 overflow-auto">
            <TeachersTable teachers={paginated} photoBaseUrl={PHOTO_BASE_URL} />
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => { setCurrentPage(p); }}
        />
      </div>

      <div className="h-4" />

      <AddTeacherDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { fetchTeachers(); setCurrentPage(1); }}
      />
    </div>
  );
}