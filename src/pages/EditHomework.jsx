import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Upload, ChevronDown, Bold, Italic, Underline,
  Strikethrough, Quote, Code, Link, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, X, Video
} from "lucide-react";

const BASE = "http://localhost:3000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

function fetchAPI(url) {
  const token = getToken();
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }).then((r) => r.json());
}

/* ── RICH TEXT TOOLBAR ── */
function RichToolbar({ editorRef }) {
  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const FONT_SIZES = ["Normal", "Small", "Large", "Huge"];
  const FONTS      = ["Sans Serif", "Serif", "Monospace"];

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50/60">
      <button onClick={() => exec("formatBlock", "h1")}
        className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors">H1</button>
      <button onClick={() => exec("formatBlock", "h2")}
        className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors">H2</button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      {[
        { icon: Bold,          cmd: "bold"          },
        { icon: Italic,        cmd: "italic"        },
        { icon: Underline,     cmd: "underline"     },
        { icon: ListOrdered,   cmd: "insertOrderedList" },
        { icon: List,          cmd: "insertUnorderedList" },
      ].map(({ icon: Icon, cmd }) => (
        <button key={cmd} onClick={() => exec(cmd)}
          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}

export default function EditHomeworkPage() {
  const navigate = useNavigate();
  const { homeworkId } = useParams();

  const [lessons,  setLessons]  = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [title,    setTitle]    = useState("");
  const [file,     setFile]     = useState(null);
  const [existingFile, setExistingFile] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");

  const editorRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await fetchAPI(`${BASE}/api/homework/all`); // Get all to find the specific one or use getOne if exists
        // Usually there should be a getOne endpoint. I'll search for it or just filter from all.
        if (res.success) {
          const hw = res.data.find(h => h.id === Number(homeworkId));
          if (hw) {
            setTitle(hw.title || "");
            setLessonId(hw.lesson_id || "");
            setExistingFile(hw.file || "");
            if (editorRef.current) {
              editorRef.current.innerHTML = hw.description || "";
            }
            
            // Also load lessons for the group
            if (hw.group_id) {
               fetchAPI(`${BASE}/api/lessons/my/group/${hw.group_id}`)
                 .then(j => { if (j.success) setLessons(j.data); });
            }
          }
        }
      } catch (err) {
        setError("Ma'lumot yuklashda xatolik");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [homeworkId]);

  const handleSubmit = async () => {
    setError("");
    const description = editorRef.current?.innerHTML || "";

    if (!lessonId)     { setError("Mavzuni tanlang");    return; }
    if (!title.trim()) { setError("Sarlavha kiriting");  return; }

    setLoading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("lesson_id",  lessonId);
      formData.append("title",      title.trim());
      if (description) formData.append("description", description);
      if (file)        formData.append("file", file);

      // Assuming partial update is supported via PATCH or PUT
      const res = await fetch(`${BASE}/api/homework/update/${homeworkId}`, {
        method: "PUT",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      navigate(-1);
    } catch (err) {
      setError(err.message || "Tizimda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-base font-semibold text-gray-800">Uyga vazifani tahrirlash</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Mavzu *</label>
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none text-sm">
            {lessons.map(l => <option key={l.id} value={l.id}>{l.theme || l.title}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Sarlavha *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none text-sm" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Izoh</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <RichToolbar editorRef={editorRef} />
            <div ref={editorRef} contentEditable className="min-h-[160px] px-4 py-3 text-sm outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-200 bg-blue-50/30 rounded-lg py-5 text-sm text-blue-600 hover:bg-blue-100 transition-all">
            <Video size={18} />
            {file ? file.name : existingFile ? "Videoni yangilash (Eski video mavjud)" : "Video yuklash"}
          </button>
          {existingFile && !file && <p className="text-[10px] text-gray-400">Joriy video: {existingFile}</p>}
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg">Bekor qilish</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg disabled:opacity-60">
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg className={`animate-spin ${className}`} width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
