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

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];
export function AppLayout({ children }: { children: ReactNode }) {
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
      </aside>
      <button
        className="theme-toggle top-right-theme-toggle"
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
      <main className="main-content">{children}</main>
      <nav className="bottom-nav">{links(true)}</nav>
    </div>
  );
}
