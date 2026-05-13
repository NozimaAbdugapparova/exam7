import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (value.startsWith("+")) return "+" + digits;
    
    if (digits.length === 9) return "+998" + digits;

    if (digits.length === 12) return "+" + digits;
    
    return value;
   };

  const handleSubmit = async () => {
    setError("");
    if (!login.trim() || !password.trim()) {
      setError("Iltimos, login va parolni kiriting.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            phone: formatPhone(login.trim()), 
            password 
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Login yoki parol noto'g'ri.");
      }

      const token = data.token || data.accessToken;
      if (!token) throw new Error("Token topilmadi.");

      // Token va rolni saqlash
      authLogin(token, data.role);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Role ga qarab sahifaga yo'naltirish
      if (data.role === "admin")        navigate("/dashboard");
      else if (data.role === "teacher") navigate("/teacher");
      else if (data.role === "student") navigate("/student");
      else navigate("/dashboard"); // fallback

    } catch (err) {
      setError(err.message || "Tizimda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="hidden md:flex flex-1 bg-[#0d1b4b] items-center justify-center relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-blue-800 opacity-20 blur-3xl -top-16 -left-16" />
        <div className="absolute w-72 h-72 rounded-full bg-indigo-900 opacity-30 blur-2xl bottom-10 right-10" />

        <div className="relative z-10 w-[72%] max-w-md bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
          <img src="./images/study.svg" alt="" />
          <p className="text-center text-white/60 text-sm tracking-wide mt-5">
            <span className="text-white font-semibold">CRM</span> — O'quv boshqaruv tizimi
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full md:w-[42%] md:min-w-[400px] bg-white flex flex-col items-center justify-center px-10 py-12 relative">

        <div className="w-full max-w-[320px] flex flex-col gap-5">

          {/* Login Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Login</label>
            <input
              type="text"
              placeholder="Loginni kiriting"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#0d1b4b] focus:bg-white focus:ring-2 focus:ring-[#0d1b4b]/10"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Parol</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Parolni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#0d1b4b] focus:bg-white focus:ring-2 focus:ring-[#0d1b4b]/10"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0d1b4b] transition"
              >
                {showPass ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-[#0d1b4b] hover:bg-[#172966] active:scale-[0.98] text-white text-sm font-semibold tracking-[2px] uppercase rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#0d1b4b]/25 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Kirish...
              </span>
            ) : "Kirish"}
          </button>
        </div>

      </div>
    </div>
  );
}