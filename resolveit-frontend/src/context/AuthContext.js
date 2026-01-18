import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null
  });

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  const hasRole = (role) => {
    return auth.user?.roles?.includes(role) || false;
  };

  const isUser = () => hasRole("ROLE_USER");
  const isOfficer = () => hasRole("ROLE_OFFICER");
  const isAdmin = () => hasRole("ROLE_ADMIN");

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      hasRole, 
      isUser, 
      isOfficer, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
