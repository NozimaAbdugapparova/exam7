import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Loader2, Pencil, Trash2 } from "lucide-react";
import AddCourseDrawer from "./AddCourseDraawer";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function Courses() {
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/courses/all`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const json = await res.json();
      if (!json.success) throw new Error("Ma'lumot olishda xatolik");
      setCourses(json.data ?? []);
    } catch (err) {
      setError(err.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    await fetchCourses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kursni o'chirishni xohlaysizmi?")) return;

    setDeletingId(id);
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/courses/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "O'chirishda xatolik");
      await fetchCourses();
    } catch (err) {
      setError(err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCourse(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800">Kurslar</h2>
            <button
              onClick={fetchCourses}
              disabled={loading}
              className="text-gray-400 hover:text-[#3d5af1] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Kurs nomi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-[#3d5af1] focus:ring-2 focus:ring-[#3d5af1]/10 w-52"
            />

            {/* Add button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 bg-[#3d5af1] hover:bg-[#2a47d6] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Kurs qo'shish
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#3d5af1]" />
            <span className="ml-2 text-sm text-gray-400">Yuklanmoqda...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={fetchCourses}
              className="text-xs text-[#3d5af1] underline"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Course Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{course.name}</h3>

                  {/* Action buttons - visible on hover */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(course);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#3d5af1] hover:bg-[#3d5af1]/5 rounded-md transition-colors"
                      title="Tahrirlash"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(course.id);
                      }}
                      disabled={deletingId === course.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="O'chirish"
                    >
                      {deletingId === course.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {course.lesson_duration && (
                    <span>{course.lesson_duration} min</span>
                  )}
                  {course.duration_month && (
                    <span>{course.duration_month} oy</span>
                  )}
                  {course.price && (
                    <span>{Number(course.price).toLocaleString()} so'm</span>
                  )}
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full text-center py-8">
                Kurslar topilmadi
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AddCourseDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSave}
        editingCourse={editingCourse}
      />
    </>
  );
}