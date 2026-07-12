import React, { useState } from "react";
import {
  Building2,
  Tags,
  Users,
  UserCheck,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type Role } from "./Sidebar";

type Department = { id: string; name: string; head: string; parent: string; employees: number; status: "active" | "inactive" };
type AssetCategory = { id: string; name: string; description: string; assetsCount: number; warrantyPeriod: string; status: "active" | "inactive" };
type Employee = { id: string; name: string; email: string; department: string; role: string; status: "active" | "inactive" };

const STATS = [
  { label: "Total Departments", value: "8", icon: Building2 },
  { label: "Asset Categories", value: "15", icon: Tags },
  { label: "Employees", value: "245", icon: Users },
  { label: "Active Managers", value: "12", icon: UserCheck },
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: "D1", name: "Engineering", head: "Sarah Jenkins", parent: "N/A", employees: 85, status: "active" },
  { id: "D2", name: "Information Technology", head: "Mike Ross", parent: "Engineering", employees: 42, status: "active" },
  { id: "D3", name: "Sales", head: "Emily Davis", parent: "N/A", employees: 110, status: "active" },
];

const MOCK_CATEGORIES: AssetCategory[] = [
  { id: "C1", name: "Laptops", description: "Standard issue and high-performance laptops", assetsCount: 450, warrantyPeriod: "3 Years", status: "active" },
  { id: "C2", name: "Monitors", description: "External displays and monitors", assetsCount: 320, warrantyPeriod: "2 Years", status: "active" },
  { id: "C3", name: "Furniture", description: "Chairs, desks, and office equipment", assetsCount: 890, warrantyPeriod: "5 Years", status: "active" },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: "E1", name: "Alex Wong", email: "alex.wong@company.com", department: "Engineering", role: "Asset Manager", status: "active" },
  { id: "E2", name: "Sarah Jenkins", email: "sarah.j@company.com", department: "Engineering", role: "Department Head", status: "active" },
  { id: "E3", name: "John Doe", email: "john.doe@company.com", department: "IT", role: "Employee", status: "active" },
];

export function OrganizationSetup({ role }: { role: Role }) {
  const [activeTab, setActiveTab] = useState("departments");

  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);

  // Modals state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState<{open: boolean, empId: string | null}>({open: false, empId: null});
  
  // Drawer state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: "", head: "", parent: "", desc: "", status: "active" });
  const [catForm, setCatForm] = useState({ name: "", desc: "", warranty: "", status: "active" });
  const [promoteForm, setPromoteForm] = useState({ role: "" });

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] text-center p-8">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 mb-4">
          <XCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">Access Denied</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Organization Setup is restricted to System Administrators.
        </p>
      </div>
    );
  }

  const handleSaveDept = () => {
    if (!deptForm.name) return toast.error("Department Name is required");
    if (departments.some(d => d.name.toLowerCase() === deptForm.name.toLowerCase())) return toast.error("Department Name must be unique");

    const newDept: Department = {
      id: `D${departments.length + 1}`,
      name: deptForm.name,
      head: deptForm.head || "Unassigned",
      parent: deptForm.parent || "N/A",
      employees: 0,
      status: deptForm.status as "active" | "inactive"
    };
    setDepartments([...departments, newDept]);
    setDeptModalOpen(false);
    setDeptForm({ name: "", head: "", parent: "", desc: "", status: "active" });
    toast.success("Department created");
  };

  const handleSaveCat = () => {
    if (!catForm.name) return toast.error("Category Name is required");
    if (categories.some(c => c.name.toLowerCase() === catForm.name.toLowerCase())) return toast.error("Category Name must be unique");

    const newCat: AssetCategory = {
      id: `C${categories.length + 1}`,
      name: catForm.name,
      description: catForm.desc,
      assetsCount: 0,
      warrantyPeriod: catForm.warranty || "N/A",
      status: catForm.status as "active" | "inactive"
    };
    setCategories([...categories, newCat]);
    setCatModalOpen(false);
    setCatForm({ name: "", desc: "", warranty: "", status: "active" });
    toast.success("Category created");
  };

  const handlePromote = () => {
    if (!promoteForm.role) return toast.error("Please select a role");
    if (promoteModalOpen.empId) {
      setEmployees(prev => prev.map(e => e.id === promoteModalOpen.empId ? { ...e, role: promoteForm.role } : e));
      toast.success("Employee role updated");
    }
    setPromoteModalOpen({open: false, empId: null});
    setPromoteForm({ role: "" });
  };

  const toggleDeptStatus = (id: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d));
    toast.success("Department status updated");
  };

  const toggleCatStatus = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
    toast.success("Category status updated");
  };

  const toggleEmpStatus = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e));
    toast.success("Employee status updated");
  };

  const handleEditMock = () => {
    toast.info("Edit functionality is available in full integration");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace · Settings
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Organization Setup
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage departments, asset categories, employees and organizational structure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "departments" && (
            <Button onClick={() => setDeptModalOpen(true)} size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Department
            </Button>
          )}
          {activeTab === "categories" && (
            <Button onClick={() => setCatModalOpen(true)} size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Category
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6 flex-shrink-0">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card-surface p-4 flex items-center gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground leading-none mb-1">{s.value}</div>
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-surface flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border px-4 py-2 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="departments">Department Management</TabsTrigger>
              <TabsTrigger value="categories">Asset Category Management</TabsTrigger>
              <TabsTrigger value="employees">Employee Directory</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Select>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "departments" && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <Th>Department Name</Th>
                    <Th>Department Head</Th>
                    <Th>Parent Department</Th>
                    <Th>Employees</Th>
                    <Th>Status</Th>
                    <Th className="text-right pr-4">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No departments found.</td></tr>
                  ) : departments.map(d => (
                    <tr key={d.id} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                      <td className="px-4 py-3">{d.head}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.parent}</td>
                      <td className="px-4 py-3 tabular">{d.employees}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEditMock}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className={d.status === "active" ? "text-destructive" : ""} onClick={() => toggleDeptStatus(d.id)}>
                              {d.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "categories" && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <Th>Category</Th>
                    <Th>Description</Th>
                    <Th>Assets Count</Th>
                    <Th>Warranty Period</Th>
                    <Th>Status</Th>
                    <Th className="text-right pr-4">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No asset categories found.</td></tr>
                  ) : categories.map(c => (
                    <tr key={c.id} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                      <td className="px-4 py-3 tabular">{c.assetsCount}</td>
                      <td className="px-4 py-3">{c.warrantyPeriod}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEditMock}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className={c.status === "active" ? "text-destructive" : ""} onClick={() => toggleCatStatus(c.id)}>
                              {c.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "employees" && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <Th>Employee Name</Th>
                    <Th>Email</Th>
                    <Th>Department</Th>
                    <Th>Current Role</Th>
                    <Th>Status</Th>
                    <Th className="text-right pr-4">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No employees found.</td></tr>
                  ) : employees.map(e => (
                    <tr key={e.id} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{e.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                      <td className="px-4 py-3">{e.department}</td>
                      <td className="px-4 py-3 font-medium text-primary">{e.role}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedEmployee(e)}>View</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPromoteModalOpen({open: true, empId: e.id})}>Promote</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleEditMock}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className={e.status === "active" ? "text-destructive" : ""} onClick={() => toggleEmpStatus(e.id)}>
                              {e.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tabs>
      </div>

      {/* Dept Modal */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Department Name *</Label><Input value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Department Head</Label><Input value={deptForm.head} onChange={e => setDeptForm({...deptForm, head: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Parent Department</Label><Input value={deptForm.parent} onChange={e => setDeptForm({...deptForm, parent: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Status</Label>
              <Select value={deptForm.status} onValueChange={v => setDeptForm({...deptForm, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDeptModalOpen(false)}>Cancel</Button><Button onClick={handleSaveDept}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cat Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Asset Category</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Category Name *</Label><Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={catForm.desc} onChange={e => setCatForm({...catForm, desc: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Warranty Period</Label><Input value={catForm.warranty} onChange={e => setCatForm({...catForm, warranty: e.target.value})} placeholder="e.g. 2 Years" /></div>
            <div className="grid gap-2"><Label>Status</Label>
              <Select value={catForm.status} onValueChange={v => setCatForm({...catForm, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatModalOpen(false)}>Cancel</Button><Button onClick={handleSaveCat}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Modal */}
      <Dialog open={promoteModalOpen.open} onOpenChange={(open) => setPromoteModalOpen({open, empId: open ? promoteModalOpen.empId : null})}>
        <DialogContent>
          <DialogHeader><DialogTitle>Promote Employee</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">Assign a management role. Note: This action immediately grants elevated system access.</p>
            <div className="grid gap-2">
              <Label>Assign Role</Label>
              <Select value={promoteForm.role} onValueChange={v => setPromoteForm({role: v})}>
                <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee (Standard)</SelectItem>
                  <SelectItem value="Department Head">Department Head</SelectItem>
                  <SelectItem value="Asset Manager">Asset Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPromoteModalOpen({open: false, empId: null})}>Cancel</Button><Button onClick={handlePromote}>Confirm Promotion</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Drawer */}
      <Sheet open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Employee Details</SheetTitle>
            <SheetDescription>{selectedEmployee?.id}</SheetDescription>
          </SheetHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground font-display text-2xl font-bold">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">{selectedEmployee.role}</span>
                      <StatusBadge status={selectedEmployee.status} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <span className="block text-xs text-muted-foreground mb-1">Department</span>
                  <div className="font-medium">{selectedEmployee.department}</div>
                </div>
                <div className="rounded-md border p-3">
                  <span className="block text-xs text-muted-foreground mb-1">Assigned Assets</span>
                  <div className="font-medium tabular">3 Active</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Activity Summary</h4>
                <div className="rounded-md border bg-muted/20 p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Bookings</span>
                      <span className="font-medium">12 Total (2 Active)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Maintenance Requests</span>
                      <span className="font-medium">4 Total</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="font-medium tabular">Today, 09:41 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
      status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-left font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </th>
  );
}
