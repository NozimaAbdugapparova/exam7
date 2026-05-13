import { useState } from "react";
import Courses from "../components/Courses";
import Rooms from "../components/Rooms";

const tabs = ["Kurslar", "Xonalar", "Xodimlar", "Xabar yuborish"];

// Namuna kurslar — backenddan keladi keyinchalik


export default function Control() {
  const [activeTab, setActiveTab] = useState("Kurslar");


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Boshqarish</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors relative
              ${activeTab === tab
                ? "text-[#3d5af1] border-b-2 border-[#3d5af1] -mb-px"
                : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Kurslar" && (
        <Courses />
      )}

      {activeTab === "Xonalar" && (
        <Rooms />
      )}

      {activeTab === "Xodimlar" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-400 text-center py-8">Xodimlar bo'limi</p>
        </div>
      )}

      {activeTab === "Xabar yuborish" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-400 text-center py-8">Xabar yuborish bo'limi</p>
        </div>
      )}
    </div>
  );
}