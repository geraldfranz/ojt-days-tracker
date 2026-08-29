import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useOjtStore } from "../../store/useOjtStore";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];
export function AppLayout({ children }: { children: ReactNode }) {
  const userName = useOjtStore((state) => state.userName);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("ojt-theme") === "dark",
  );
  const links = (mobile = false) =>
    nav.map(({ to, label, icon: Icon }) => (
      <NavLink to={to} end={to === "/"} key={to}>
        <Icon size={mobile ? 20 : 19} />
        <span>{label}</span>
      </NavLink>
    ));
  return (
    <div className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>
          OJT days
        </div>
        <nav>{links()}</nav>
        <div className="sidebar-foot">
          <span className="avatar">{(userName || "?").charAt(0).toUpperCase()}</span>
          <div>
            <strong>{userName || "Trainee"}</strong>
            <small>Internship 2026</small>
          </div>
          <button
            className="theme-toggle"
            onClick={() => {
              const nextMode = !darkMode;
              setDarkMode(nextMode);
              localStorage.setItem("ojt-theme", nextMode ? "dark" : "light");
            }}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <button
          className="theme-toggle mobile-theme-toggle"
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            localStorage.setItem("ojt-theme", nextMode ? "dark" : "light");
          }}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {children}
      </main>
      <nav className="bottom-nav">{links(true)}</nav>
    </div>
  );
}
