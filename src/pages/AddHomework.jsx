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

      <select
        onChange={(e) => exec("fontName", e.target.value)}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white outline-none cursor-pointer"
      >
        {FONTS.map((f) => <option key={f}>{f}</option>)}
      </select>

      <select
        onChange={(e) => exec("fontSize", FONT_SIZES.indexOf(e.target.value) + 1)}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white outline-none cursor-pointer"
      >
        {FONT_SIZES.map((s) => <option key={s}>{s}</option>)}
      </select>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {[
        { icon: Bold,          cmd: "bold"          },
        { icon: Italic,        cmd: "italic"        },
        { icon: Underline,     cmd: "underline"     },
        { icon: Strikethrough, cmd: "strikeThrough" },
        { icon: Quote,         cmd: "formatBlock", val: "blockquote" },
        { icon: Code,          cmd: "formatBlock", val: "pre"        },
      ].map(({ icon: Icon, cmd, val }) => (
        <button key={cmd + (val || "")} onClick={() => exec(cmd, val)}
          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
          <Icon size={13} />
        </button>
      ))}

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <button onClick={() => exec("insertOrderedList")}
        className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
        <ListOrdered size={13} />
      </button>
      <button onClick={() => exec("insertUnorderedList")}
        className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
        <List size={13} />
      </button>

      {[
        { icon: AlignLeft,    cmd: "justifyLeft"  },
        { icon: AlignCenter,  cmd: "justifyCenter" },
        { icon: AlignRight,   cmd: "justifyRight"  },
        { icon: AlignJustify, cmd: "justifyFull"   },
      ].map(({ icon: Icon, cmd }) => (
        <button key={cmd} onClick={() => exec(cmd)}
          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
          <Icon size={13} />
        </button>
      ))}

      <button
        onClick={() => {
          const url = prompt("URL kiriting:");
          if (url) exec("createLink", url);
        }}
        className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors"
      >
        <Link size={13} />
      </button>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function AddHomeworkPage() {
  const navigate  = useNavigate();
  // groupId URL params orqali keladi: /homework/add/:groupId
  const { groupId } = useParams();

  const [lessons,  setLessons]  = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [title,    setTitle]    = useState("");
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const editorRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    fetchAPI(`${BASE}/api/lessons/my/group/${groupId}`)
      .then((j) => { if (j.success) setLessons(j.data ?? []); })
      .catch(() => {});
  }, [groupId]);

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
      formData.append("group_id",   groupId);
      formData.append("title",      title.trim());
      if (description) formData.append("description", description);
      if (file)        formData.append("file", file);

      const res = await fetch(`${BASE}/api/homework/new`, {
        method: "POST",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      // Muvaffaqiyatli — orqaga qayt
      navigate(-1);
    } catch (err) {
      setError(err.message || "Tizimda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-base font-semibold text-gray-800">
          Yangi uyga vazifa yaratish
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">

        {/* Mavzu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Mavzu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition appearance-none cursor-pointer text-gray-600"
            >
              <option value="">Mavzulardan birini tanlang</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title || l.topic || l.name || `Dars #${l.id}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Sarlavha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Sarlavha <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Vazifa sarlavhasini kiriting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        {/* Izoh — Rich text editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Izoh
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
            <RichToolbar editorRef={editorRef} />
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[160px] px-4 py-3 text-sm text-gray-800 outline-none"
              style={{ lineHeight: "1.6" }}
            />
          </div>
        </div>

        {/* Fayl yuklash */}
        <div className="flex flex-col gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-200 bg-blue-50/30 rounded-lg py-5 text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Video size={18} />
            {file ? file.name : "Video yuklash"}
          </button>
          {file && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600 truncate">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-400 transition-colors ml-2 shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            E'lon qilish
          </button>
        </div>

      </div>
    </div>
  );
}