import re

with open('src/components/assetflow/OrganizationSetup.tsx', 'r') as f:
    content = f.read()

# 1. Update promoteForm state to include departmentId
form_regex = r'const \[promoteForm, setPromoteForm\] = useState\(\{ role: "" \}\);'
form_replacement = 'const [promoteForm, setPromoteForm] = useState({ role: "", departmentId: "" });'
content = re.sub(form_regex, form_replacement, content)

# 2. Update handlePromote to pass departmentId
handle_promote_regex = r'const handlePromote = async \(\) => \{\n\s*if \(!promoteModalOpen\.empId \|\| !promoteForm\.role\) return;\n\s*try \{\n\s*let newRole = "employee";\n\s*if \(promoteForm\.role === "Department Head"\) newRole = "department_head";\n\s*else if \(promoteForm\.role === "Asset Manager"\) newRole = "asset_manager";\n\n\s*await promoteUser\(promoteModalOpen\.empId, newRole as any\);'
handle_promote_replacement = """const handlePromote = async () => {
    if (!promoteModalOpen.empId || !promoteForm.role) return;
    try {
      let newRole = "employee";
      if (promoteForm.role === "Department Head") newRole = "department_head";
      else if (promoteForm.role === "Asset Manager") newRole = "asset_manager";

      await promoteUser(promoteModalOpen.empId, newRole as any, promoteForm.departmentId || null);"""
content = re.sub(handle_promote_regex, handle_promote_replacement, content)

# 3. Update the modal UI to include a department selector if role === 'Department Head'
modal_regex = r'(<SelectItem value="Asset Manager">Asset Manager</SelectItem>\n\s*</SelectContent>\n\s*</Select>\n\s*</div>\n\s*</div>)'
modal_replacement = r"""\1
            {promoteForm.role === "Department Head" && (
              <div className="grid gap-2 mt-4">
                <Label>Assign to Department</Label>
                <Select value={promoteForm.departmentId} onValueChange={v => setPromoteForm({...promoteForm, departmentId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select a department..." /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}"""
content = re.sub(modal_regex, modal_replacement, content)

with open('src/components/assetflow/OrganizationSetup.tsx', 'w') as f:
    f.write(content)
