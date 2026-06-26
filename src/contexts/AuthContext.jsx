import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // ✅ Read localStorage directly on first render — no useEffect needed
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? true : null; // null = still "deciding", true = logged in
  });

  const [role, setRole] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const storedRole = localStorage.getItem("role");
    if (storedRole) return storedRole;
    const decoded = parseJwt(token);
    return decoded?.role?.toLowerCase() || null;
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {}
    }
    const decoded = parseJwt(token);
    if (decoded) {
      const resolvedRole = decoded.role?.toLowerCase() || localStorage.getItem("role") || "student";
      const name = decoded.first_name && decoded.last_name 
        ? `${decoded.first_name} ${decoded.last_name}`
        : (decoded.email ? decoded.email.split('@')[0] : (resolvedRole === "admin" ? "Admin" : resolvedRole === "teacher" ? "O'qituvchi" : "Talaba"));
      
      return {
        id: decoded.id,
        email: decoded.email,
        name: name,
        role: resolvedRole
      };
    }
    return null;
  });

  const login = (token, userRole) => {
    localStorage.setItem("token", token);
    const resolvedRole = userRole || parseJwt(token)?.role?.toLowerCase() || "student";
    localStorage.setItem("role", resolvedRole);
    const decoded = parseJwt(token);
    const name = decoded?.first_name && decoded?.last_name
      ? `${decoded.first_name} ${decoded.last_name}`
      : (decoded?.email ? decoded.email.split('@')[0] : (resolvedRole === "admin" ? "Admin" : resolvedRole === "teacher" ? "O'qituvchi" : "Talaba"));

    const resolvedUser = {
      id: decoded?.id || null,
      email: decoded?.email || "",
      name: name,
      role: resolvedRole
    };
    localStorage.setItem("user", JSON.stringify(resolvedUser));

    setUser(resolvedUser);
    setRole(resolvedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
