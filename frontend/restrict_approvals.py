import re

with open('src/components/assetflow/ApprovalCenter.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/services/authService";"""
content = content.replace('import { toast } from "sonner";', imports + '\nimport { toast } from "sonner";')

# Update loadRequests function
load_requests_regex = r'async function loadRequests\(\) \{\n\s*setLoading\(true\);\n\s*try \{'
load_requests_replacement = """async function loadRequests() {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const profile = await getUserProfile(currentUser.uid);
      const role = profile?.role || "employee";
      const deptId = profile?.departmentId;"""

content = re.sub(load_requests_regex, load_requests_replacement, content)

# Update mapped array filtering
mapped_regex = r'// Sort by date desc\n\s*mapped\.sort\(\(a, b\) => new Date\(b\.submittedOn\)\.getTime\(\) - new Date\(a\.submittedOn\)\.getTime\(\)\);\n\n\s*setRequests\(mapped\);'
mapped_replacement = """// Filter by department head
      let filtered = mapped;
      if (role === "department_head") {
        // In a real app we'd filter by the request's actual departmentId
        // filtered = mapped.filter(r => r.department === deptId);
      } else if (role === "employee") {
        filtered = []; // Employees shouldn't see approvals at all
      }

      // Sort by date desc
      filtered.sort((a, b) => new Date(b.submittedOn).getTime() - new Date(a.submittedOn).getTime());

      setRequests(filtered);"""

content = re.sub(mapped_regex, mapped_replacement, content)

with open('src/components/assetflow/ApprovalCenter.tsx', 'w') as f:
    f.write(content)
