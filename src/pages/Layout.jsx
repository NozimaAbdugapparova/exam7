import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../contexts/SidebarContext";


export default function Layout({ children }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar fixed - alohida */}
      <Sidebar />
      
      {/* Asosiy maydon - Sidebar o'ng tomonida */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Navbar />
        
        <main className="flex-1 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
