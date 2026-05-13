import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import AddCourseDrawer from "./AddCourseDraawer";

const mockCourses = [
  { id: 1, name: "Backend",  hours: 180, months: 8, price: "2000000 so'm"  },
  { id: 2, name: "Frontend", hours: 120, months: 4, price: "15000000 so'm" },
];

export default function Courses() {
  const [search,     setSearch]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredCourses = mockCourses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data) => {
    console.log("Yangi kurs:", data);
    // TODO: API ga yuborish
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800">Kurslar</h2>
            <button className="text-gray-400 hover:text-[#3d5af1] transition-colors">
              <RefreshCw className="w-4 h-4" />
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

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <h3 className="font-semibold text-gray-800 mb-3">{course.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{course.hours} soat</span>
                <span>{course.months} oy</span>
                <span>{course.price}</span>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">
              Kurslar topilmadi
            </p>
          )}
        </div>
      </div>

      {/* Drawer */}
      <AddCourseDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}