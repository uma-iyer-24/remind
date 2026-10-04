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
        <Box className="h-6 w-6 text-teal-900" />
        <span className="font-display text-lg font-semibold text-stone-900">Remind</span>
      </Link>
      <nav className="flex items-center gap-5">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm transition ${
              pathname === to ? "text-teal-900" : "text-slate-600 hover:text-stone-950"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
