import re

# 1. Update Topbar.tsx
with open('src/components/assetflow/Topbar.tsx', 'r') as f:
    tb_content = f.read()

# Remove the dropdown HTML from Topbar.tsx
dropdown_regex = r'\{\/\* Role switcher \(demo\) \*\/\}.*?</select>\n      </div>'
replacement = """{/* Role switcher (Real Role Display) */}
      <div className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 md:flex">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Role
        </span>
        <span className="text-xs font-medium text-foreground">
          {ROLE_LABEL[role] || "Employee"}
        </span>
      </div>"""

tb_content = re.sub(dropdown_regex, replacement, tb_content, flags=re.DOTALL)

with open('src/components/assetflow/Topbar.tsx', 'w') as f:
    f.write(tb_content)


# 2. Update app.tsx
with open('src/routes/app.tsx', 'r') as f:
    app_content = f.read()

app_imports = """import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/services/authService";"""

app_content = app_content.replace('import { createFileRoute } from "@tanstack/react-router";\nimport { useState } from "react";', app_imports)

app_logic = """
function AppShell() {
  const [role, setRole] = useState<Role>("employee");
  const [active, setActive] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.role) {
          setRole(profile.role as Role);
        }
      } else {
        navigate({ to: "/login" });
      }
    });
    return () => unsubscribe();
  }, [navigate]);
"""

app_content = re.sub(r'function AppShell\(\) \{\n  const \[role, setRole\] = useState<Role>\("admin"\);\n  const \[active, setActive\] = useState\("dashboard"\);\n  const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);', app_logic.strip(), app_content)

with open('src/routes/app.tsx', 'w') as f:
    f.write(app_content)


# 3. Update authService.ts for admin email
with open('src/services/authService.ts', 'r') as f:
    auth_content = f.read()

auth_register_regex = r'const userDoc: UserDocument = \{\n    uid: user\.uid,\n    email: user\.email \|\| email,\n    displayName: name,\n    role: "employee",'
auth_register_replacement = """const userDoc: UserDocument = {
    uid: user.uid,
    email: user.email || email,
    displayName: name,
    role: email.toLowerCase() === "admin@assetflow.com" ? "admin" : "employee","""

auth_content = re.sub(auth_register_regex, auth_register_replacement, auth_content)

with open('src/services/authService.ts', 'w') as f:
    f.write(auth_content)

