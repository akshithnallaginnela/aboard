// Sub-navigation shared by the two settings screens. NavLink sets aria-current="page".
import { NavLink } from "react-router";

import { cn } from "~/lib/utils";

const LINKS = [
  { to: "/settings/profile", label: "Your profile" },
  { to: "/settings/privacy", label: "Account and privacy" },
];

export function SettingsNav() {
  return (
    <nav aria-label="Settings" className="mb-6 border-b border-divider">
      <ul className="flex flex-wrap gap-x-2">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "inline-flex min-h-11 items-center px-3 font-semibold underline-offset-[10px] hover:underline",
                  isActive ? "text-primary underline decoration-2" : "text-muted-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
