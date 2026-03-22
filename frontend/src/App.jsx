// SailScore App v1.2 - 2026-03-05

import Register from "./pages/Register";
import Results from "./pages/Results";
import Regatta from "./pages/Regatta";
import NOR from "./pages/NOR";
import Noticeboard from "./pages/Noticeboard";
import "./pages/Results.css";
import Registrations from "./pages/Registrations";
import PrintView from "./pages/PrintView";
import { useState, useEffect, createContext, useContext } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FleetManager from "./pages/FleetManager";
import RaceEntry from "./pages/RaceEntry";
import Standings from "./pages/Standings";
import { api } from "./api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ name: "dashboard", params: {} });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me", token)
        .then(u => setUser({ ...u, token }))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    const data = await api.post("/auth/login", form, null, "application/x-www-form-urlencoded");
    localStorage.setItem("token", data.access_token);
    const me = await api.get("/auth/me", data.access_token);
    setUser({ ...me, token: data.access_token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage({ name: "dashboard", params: {} });
  };

  const navigate = (name, params = {}) => setPage({ name, params });

  // Public pages — check before auth or loading
  if (window.location.pathname === "/register") return <Register />;
  if (window.location.pathname.startsWith("/results")) return <Results />;
  if (window.location.pathname.startsWith("/regatta")) return <Regatta />;
  if (window.location.pathname.startsWith("/nor")) return <NOR />;
  if (window.location.pathname.startsWith("/noticeboard")) return <Noticeboard />;

  // Redirect ocregatta.com root to /regatta
  if (window.location.hostname === "ocregatta.com" || window.location.hostname === "www.ocregatta.com") {
    window.location.href = "/regatta";
    return null;
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="buoy-spinner" />
    </div>
  );

  if (!user) return (
    <AuthContext.Provider value={{ user, login, logout, navigate }}>
      <Login />
    </AuthContext.Provider>
  );

  const pageMap = {
  dashboard: <Dashboard />,
  registrations: <Registrations seriesId={page.params.seriesId} seriesName={page.params.seriesName} />,
  fleet: <FleetManager seriesId={page.params.seriesId} seriesName={page.params.seriesName} />,
  race: <RaceEntry seriesId={page.params.seriesId} seriesName={page.params.seriesName} raceId={page.params.raceId} />,
  standings: <Standings seriesId={page.params.seriesId} seriesName={page.params.seriesName} />,
  print: <PrintView seriesId={page.params.seriesId} seriesName={page.params.seriesName} />,
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, navigate }}>
      <div className="app">
        <Nav page={page.name} />
        <main className="main-content">
          {pageMap[page.name] || <Dashboard />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}

function Nav({ page }) {
  const { user, logout, navigate } = useAuth();
  return (
    <nav className="navbar">
      <button className="nav-brand" onClick={() => navigate("dashboard")}>
        <span className="brand-icon">⛵</span>
        <span className="brand-name">SailScore</span>
      </button>
      <div className="nav-right">
        <span className="nav-user">{user.name}</span>
        <button className="btn-ghost" onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}
