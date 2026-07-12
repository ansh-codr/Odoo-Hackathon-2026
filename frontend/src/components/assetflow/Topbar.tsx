import { Bell, Search, ChevronDown, HelpCircle } from "lucide-react";
import type { Role } from "./Sidebar";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  asset_manager: "Asset Manager",
  department_head: "Department Head",
  employee: "Employee",
};

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../lib/firebase";

export function Topbar({
  role,
  onRoleChange,
}: {
  role: Role;
  onRoleChange: (r: Role) => void;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-5 backdrop-blur">
      {/* Search */}
      <div className="relative flex max-w-xl flex-1 items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets, tags, people, locations…"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-16 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <kbd className="pointer-events-none absolute right-2 hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex tabular">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Role switcher (demo) */}
      <div className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 md:flex">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          View as
        </span>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as Role)}
          className="bg-transparent text-xs font-medium text-foreground outline-none"
        >
          <option value="admin">Admin</option>
          <option value="asset_manager">Asset Manager</option>
          <option value="department_head">Department Head</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <button className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <HelpCircle className="h-4 w-4" />
      </button>

      {/* Notifications */}
      <button className="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground tabular">
          3
        </span>
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 rounded-md pl-1 pr-2 py-1 hover:bg-muted">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground uppercase">
          {user ? (user.displayName ? user.displayName.slice(0, 2) : user.email?.slice(0, 2)) : "US"}
        </div>
        <div className="hidden text-left leading-tight md:block">
          <div className="text-xs font-semibold text-foreground">
            {user ? (user.displayName || user.email) : "Guest User"}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground">{ROLE_LABEL[role]}</div>
        </div>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
      </button>
    </header>
  );
}
