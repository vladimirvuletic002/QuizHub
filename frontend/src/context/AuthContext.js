import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // cuva AuthResponse

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) setAuth(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (authObj) => {
    localStorage.setItem("auth", JSON.stringify(authObj));
    setAuth(authObj);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);