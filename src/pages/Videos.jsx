import { useState, useEffect } from "react";
import { Video, Play, Calendar, User, Search, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

export default function Videos() {
  const { role } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const token = getToken();
        // Fetching all homework from the API
        const res = await fetch(`${BASE}/api/homework/all`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const json = await res.json();
        if (json.success) {
          // Filter only items that have a file (which we now treat as video)
          const filtered = (json.data || []).filter(item => item.file);
          setVideos(filtered);
        } else {
          throw new Error("Videolarni yuklashda xatolik");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Videolar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Barcha yuklangan dars va vazifa videolari
          </p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Videolarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Videolar yuklanmoqda...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center text-sm">
          {error}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Hozircha videolar mavjud emas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              {/* Thumbnail / Player overlay */}
              <div className="aspect-video bg-gray-900 relative flex items-center justify-center cursor-pointer overflow-hidden">
                <video 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  src={`${BASE}/uploads/files/${video.file}`}
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 group-hover:bg-[#3d5af1] group-hover:border-[#3d5af1] transition-all">
                  <Play fill="currentColor" size={20} className="ml-1" />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-[15px] mb-3 line-clamp-1 group-hover:text-[#3d5af1] transition-colors">
                  {video.title}
                </h3>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Calendar size={13} />
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <User size={13} />
                    <span>{video.teacher_id ? "O'qituvchi" : video.user_id ? "Admin" : "CRM"}</span>
                  </div>
                </div>

                <a 
                  href={`${BASE}/uploads/files/${video.file}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-[#3d5af1] text-xs font-semibold py-2.5 rounded-xl transition-all"
                >
                  To'liq ko'rish
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
