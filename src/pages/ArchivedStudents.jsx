import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Loader2, Trash2, Pencil } from "lucide-react";

const BASE       = "http://localhost:3000";
const API_URL    = `${BASE}/api/students/all/archived`;
const PHOTO_BASE = `${BASE}/uploads/`;
const PAGE_SIZE  = 10;

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6","#f97316","#84cc16"];
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, firstName, lastName }) {
  const [err, setErr] = useState(false);
  const full     = `${firstName} ${lastName}`;
  const initials = (firstName?.[0] || "").toUpperCase() + (lastName?.[0] || "").toUpperCase();

  if (!src || err) {
    return (
      <div style={{ backgroundColor: stringToColor(full) }}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
      </div>
    );
  }
  return (
    <img src={src} alt={full} onError={() => setErr(true)}
      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />
  );
}

function StudentRow({ student, selected, onSelect }) {
  const fullName  = `${student.first_name} ${student.last_name}`;
  const avatarSrc = student.photo ? `${PHOTO_BASE}${student.photo}` : null;

  return (
    <tr className={`border-b border-gray-100 transition-colors ${selected ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}>
      <td className="px-3 py-2.5 w-9">
        <input type="checkbox" checked={selected} onChange={onSelect}
          className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer" />
      </td>
      <td className="px-3 py-2.5 w-12">
        <Avatar src={avatarSrc} firstName={student.first_name} lastName={student.last_name} />
      </td>
      <td className="px-3 py-2.5">
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{fullName}</span>
      </td>
      <td className="px-3 py-2.5 text-xs text-gray-500">{student.email || "—"}</td>
      <td className="px-3 py-2.5 text-xs text-gray-500">{student.phone || "—"}</td>
      <td className="px-3 py-2.5 text-xs text-gray-500">{formatDate(student.birth_date)}</td>
      <td className="px-3 py-2.5 text-xs text-gray-500">{student.address || "—"}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-0.5">
          <button className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
            <Pencil size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

const COLUMNS = ["Rasm", "Ism familiyasi", "Email", "Telefon", "Tug'ilgan sana", "Manzil", "Amallar"];

export default function ArchivedStudents() {
  const navigate = useNavigate();

  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true); setError(null);
        const token = getToken();
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const json = await res.json();
        if (!json.success) throw new Error("Ma'lumot olishda xatolik");
        setStudents(json.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const filtered   = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allSelected = selected.length === paginated.length && paginated.length > 0;
  const toggleAll   = () => setSelected(allSelected ? [] : paginated.map(s => s.id));
  const toggleOne   = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 border border-gray-200 transition-colors"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Arxiv</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                O'chirilgan talabalar ro'yxati
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 mb-3 flex items-center justify-end gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search" value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-52 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" />
        </div>
      </div>

      {/* Table card */}
      <div className="mx-4 flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
          <button
            disabled={selected.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={13} />
            Delete {selected.length > 0 && `(${selected.length})`}
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            <span className="ml-2 text-xs text-gray-400">Yuklanmoqda...</span>
          </div>
        )}
        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-xs text-red-500 font-medium">{error}</span>
            <button onClick={() => window.location.reload()} className="text-xs text-blue-600 underline">
              Qayta urinish
            </button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <span className="text-xs text-gray-400">Arxivda talabalar yo'q</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && paginated.length > 0 && (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-3 py-2.5 w-9">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer" />
                  </th>
                  {COLUMNS.map(col => (
                    <th key={col} className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginated.map(student => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    selected={selected.includes(student.id)}
                    onSelect={() => toggleOne(student.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 bg-white">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              ← Oldingi
            </button>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${currentPage === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Keyingi →
            </button>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}