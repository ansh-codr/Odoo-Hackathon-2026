import re

with open('src/components/assetflow/Sidebar.tsx', 'r') as f:
    content = f.read()

# Replace NavItem definition
nav_type = """type NavItem = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: string | null;
  allowedRoles: Role[];
};"""

content = re.sub(r'type NavItem = \{.*?managerOnly\?: boolean;\n\};', nav_type, content, flags=re.DOTALL)

# Replace NAV array
nav_array = """const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "assets", label: "Assets", icon: Package, badge: "1,284", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "allocations", label: "Allocations", icon: ArrowLeftRight, badge: null, allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "bookings", label: "Bookings", icon: CalendarClock, badge: "12", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "maintenance", label: "Maintenance", icon: Wrench, badge: "4", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "approvals", label: "Approvals", icon: ClipboardCheck, badge: "14", allowedRoles: ["asset_manager", "department_head"] },
  { key: "audits", label: "Audits", icon: ClipboardCheck, badge: null, allowedRoles: ["admin", "asset_manager"] },
  { key: "reports", label: "Reports", icon: BarChart3, badge: null, allowedRoles: ["admin", "department_head"] },
  { key: "notifications", label: "Notifications", icon: Bell, badge: "3", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "org", label: "Organization Setup", icon: Building2, badge: null, allowedRoles: ["admin"] },
];"""

content = re.sub(r'const NAV: NavItem\[\] = \[.*?\];', nav_array, content, flags=re.DOTALL)

# Replace logic in the render map
logic_regex = r'if \(item\.adminOnly && role !== "admin"\) return null;\n\s*if \(item\.managerOnly && role !== "asset_manager"\) return null;'
logic_replacement = 'if (!item.allowedRoles.includes(role)) return null;'
content = re.sub(logic_regex, logic_replacement, content)

with open('src/components/assetflow/Sidebar.tsx', 'w') as f:
    f.write(content)
