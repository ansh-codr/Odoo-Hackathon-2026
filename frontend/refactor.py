import re

with open(r't:\odoo\Odoo-Hackathon-2026\frontend\src\components\assetflow\ResourceBookings.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
code = code.replace(
    'import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";',
    'import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";\nimport { getBookings, createBooking, cancelBooking } from "../../services/bookingService";\nimport { getAssets } from "../../services/assetService";\nimport { getDepartments } from "../../services/orgService";\nimport { Booking, Asset, Department } from "../../services/types";'
)

# 2. Remove local type and INITIAL_BOOKINGS
code = re.sub(r'type BookingStatus.*?\];', '', code, flags=re.DOTALL)

# 3. State replacements
code = code.replace(
    'const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);',
    '''const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  useEffect(() => {
    async function load() {
      try {
        const [bkgs, asts, depts] = await Promise.all([
          getBookings(),
          getAssets(),
          getDepartments()
        ]);
        setBookings(bkgs);
        setAssets(asts.filter(a => a.sharedResource || a.categoryId === "Vehicle" || a.categoryId === "Space"));
        setDepartments(depts);
      } catch (err) {
        toast.error("Failed to load booking data");
      }
    }
    load();
  }, []);'''
)

# 4. handleCreateBooking
handle_create = '''const handleCreateBooking = async () => {
    setFormError("");

    if (!newResource || !newDate || !newStart || !newEnd || !newDept) {
      setFormError("Please fill in all mandatory fields (Resource, Date, Start, End, Department).");
      return;
    }

    if (newStart >= newEnd) {
      setFormError("End Time must be after Start Time.");
      return;
    }

    try {
      const selectedAsset = assets.find(a => a.id === newResource);
      if (!selectedAsset) throw new Error("Invalid asset");
      
      const newB = await createBooking({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        departmentId: newDept,
        date: newDate,
        startTime: newStart,
        endTime: newEnd,
        purpose: newPurpose
      });
      setBookings(prev => [newB, ...prev]);
      setIsNewModalOpen(false);
      toast.success("Booking Confirmed");
      
      setNewResource("");
      setNewDate("");
      setNewStart("");
      setNewEnd("");
      setNewPurpose("");
      setNewDept("");
    } catch (err: any) {
      setFormError(err.message || "Failed to create booking");
    }
  };'''
code = re.sub(r'const handleCreateBooking = \(\) => \{.*?setNewDept\(\"\"\);\n  \};', handle_create, code, flags=re.DOTALL)

# 5. handleCancelBooking
handle_cancel = '''const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } as Booking : b))
      );
      setSelectedBooking(null);
      toast.success("Booking Cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };'''
code = re.sub(r'const handleCancelBooking = \(id: string\) => \{.*?toast\.success\(\"Booking Cancelled\"\);\n  \};', handle_cancel, code, flags=re.DOTALL)

# 6. Status and variables updates
code = code.replace('status === "ongoing"', 'status === "CheckedIn"')
code = code.replace('status === "upcoming"', 'status === "Reserved"')
code = code.replace('status !== "cancelled"', 'status !== "Cancelled"')
code = code.replace('{b.resource}', '{b.assetName}')
code = code.replace('{b.bookedBy}', '{b.userName}')
code = code.replace('{b.category}', '')
code = code.replace('{b.department}', '{departments.find(d => d.id === b.departmentId)?.name || b.departmentId}')
code = code.replace('{selectedBooking.resource}', '{selectedBooking.assetName}')
code = code.replace('{selectedBooking.bookedBy}', '{selectedBooking.userName}')
code = code.replace('{selectedBooking.department}', '{departments.find(d => d.id === selectedBooking.departmentId)?.name || selectedBooking.departmentId}')

# 7. Modal dropdowns
code = re.sub(
    r'<SelectContent>\s*<SelectItem value="Meeting Room B2">.*?</SelectContent>',
    '<SelectContent>\\n                  {assets.map(a => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}\\n                </SelectContent>',
    code,
    flags=re.DOTALL
)
code = re.sub(
    r'<SelectContent>\s*<SelectItem value="Engineering">.*?</SelectContent>',
    '<SelectContent>\\n                  {departments.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}\\n                </SelectContent>',
    code,
    flags=re.DOTALL
)

with open(r't:\odoo\Odoo-Hackathon-2026\frontend\src\components\assetflow\ResourceBookings.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
