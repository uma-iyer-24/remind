import { Box } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/architecture", label: "Architecture" },
  { to: "/create", label: "Create palace" },
];

export default function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <Box className="h-6 w-6 text-amber-glow" />
        <span className="font-display text-lg font-semibold text-white">Remind</span>
      </Link>
      <nav className="flex items-center gap-5">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm transition ${
              pathname === to ? "text-amber-glow" : "text-slate-300 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
