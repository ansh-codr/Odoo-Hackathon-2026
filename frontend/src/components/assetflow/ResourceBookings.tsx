import React, { useState } from "react";
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  ArrowUpDown,
  CalendarDays,
  List,
} from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type BookingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

type Booking = {
  id: string;
  resource: string;
  category: string;
  bookedBy: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
};

const STATS = [
  { label: "Total Bookings", value: "142", delta: "12%", trend: "up", icon: CalendarClock, sub: "this month" },
  { label: "Active Bookings", value: "8", delta: "2", trend: "up", icon: Clock, sub: "currently ongoing" },
  { label: "Upcoming Bookings", value: "24", delta: "5", trend: "up", icon: CheckCircle2, sub: "next 7 days" },
  { label: "Available Resources", value: "36", delta: "3", trend: "down", icon: Package, sub: "ready to book" },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "B-1001",
    resource: "Meeting Room B2",
    category: "Space",
    bookedBy: "Sarah Jenkins",
    department: "Marketing",
    date: "2026-07-12",
    startTime: "09:00",
    endTime: "10:00",
    status: "completed",
  },
  {
    id: "B-1002",
    resource: "Projector X1",
    category: "Equipment",
    bookedBy: "David Chen",
    department: "Engineering",
    date: "2026-07-12",
    startTime: "14:00",
    endTime: "16:00",
    status: "ongoing",
  },
  {
    id: "B-1003",
    resource: "Company Van (Ford Transit)",
    category: "Vehicle",
    bookedBy: "Mike Ross",
    department: "Logistics",
    date: "2026-07-13",
    startTime: "08:00",
    endTime: "18:00",
    status: "upcoming",
  },
];

export function ResourceBookings() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // New Booking Form State
  const [newResource, setNewResource] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newDept, setNewDept] = useState("");
  const [formError, setFormError] = useState("");

  const handleCreateBooking = () => {
    setFormError("");

    if (!newResource || !newDate || !newStart || !newEnd || !newDept) {
      setFormError("Please fill in all mandatory fields (Resource, Date, Start, End, Department).");
      return;
    }

    if (newStart >= newEnd) {
      setFormError("End Time must be after Start Time.");
      return;
    }

    const bookingDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      setFormError("Cannot create a booking in the past.");
      return;
    }

    // Overlap Prevention Logic
    const hasOverlap = bookings.some((b) => {
      if (b.resource !== newResource) return false;
      if (b.date !== newDate) return false;
      if (b.status === "cancelled") return false;

      // Overlap condition:
      // (Start A < End B) and (End A > Start B)
      return newStart < b.endTime && newEnd > b.startTime;
    });

    if (hasOverlap) {
      setFormError("This resource is already booked during the selected time slot.");
      return;
    }

    const newBooking: Booking = {
      id: `B-${1000 + bookings.length + 1}`,
      resource: newResource,
      category: "Space", // Mocking category for demo
      bookedBy: "Current User",
      department: newDept,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      status: "upcoming",
    };

    setBookings((prev) => [newBooking, ...prev]);
    setIsNewModalOpen(false);
    toast.success("Booking Confirmed", {
      description: `Successfully booked ${newResource}.`,
    });
    
    // Reset form
    setNewResource("");
    setNewDate("");
    setNewStart("");
    setNewEnd("");
    setNewPurpose("");
    setNewDept("");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bookings · Workspace
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Shared Resource Booking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book and manage shared organizational resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            <Plus className="h-3.5 w-3.5" />
            New Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          const up = s.trend === "up";
          return (
            <div key={s.label} className="card-surface p-4">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold tracking-tight tabular text-foreground">
                  {s.value}
                </div>
                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular ${
                    up ? "text-status-available" : "text-status-lost"
                  }`}
                >
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.delta}
                </div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="mt-6 card-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Select>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="space">Space</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Clear Filters
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setView("list")}
              className={`inline-flex h-7 items-center justify-center gap-1.5 rounded px-3 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`inline-flex h-7 items-center justify-center gap-1.5 rounded px-3 text-xs font-medium transition-colors ${
                view === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>
        </div>

        {view === "list" ? (
          <div className="overflow-x-auto">
            {bookings.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Th>Resource</Th>
                    <Th>Booked By</Th>
                    <Th>Date</Th>
                    <Th>Time Slot</Th>
                    <Th>Status</Th>
                    <Th className="text-right pr-4">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{b.resource}</div>
                        <div className="text-[11px] text-muted-foreground">{b.category}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="font-medium text-foreground">{b.bookedBy}</div>
                        <div className="text-[11px] text-muted-foreground">{b.department}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-foreground tabular">
                        {b.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground tabular">
                        {b.startTime} - {b.endTime}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={b.status as any} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 pr-4 text-right">
                        <button 
                          onClick={() => setSelectedBooking(b)}
                          className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">No bookings found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new booking.</p>
                <Button onClick={() => setIsNewModalOpen(true)} className="mt-4" size="sm">
                  Create First Booking
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
             <CalendarDays className="h-10 w-10 text-muted-foreground opacity-50" />
             <h3 className="mt-4 font-medium text-foreground">Calendar View</h3>
             <p className="mt-1 text-sm text-muted-foreground max-w-[300px]">
               Calendar view visualization would be rendered here, displaying booked time slots across resources.
             </p>
          </div>
        )}
        
        {view === "list" && bookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span className="tabular">{bookings.length} of {bookings.length}</span>
            <div className="flex items-center gap-1">
              <button className="h-7 rounded border border-border px-2 hover:bg-muted">Prev</button>
              <button className="h-7 rounded border border-border bg-background px-2 hover:bg-muted">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="resource">Select Resource *</Label>
              <Select value={newResource} onValueChange={setNewResource}>
                <SelectTrigger id="resource">
                  <SelectValue placeholder="e.g. Meeting Room B2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting Room B2">Meeting Room B2</SelectItem>
                  <SelectItem value="Meeting Room A1">Meeting Room A1</SelectItem>
                  <SelectItem value="Projector X1">Projector X1</SelectItem>
                  <SelectItem value="Company Van (Ford Transit)">Company Van (Ford Transit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Booking Date *</Label>
              <Input 
                id="date" 
                type="date" 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Time *</Label>
                <Input 
                  id="start" 
                  type="time" 
                  value={newStart} 
                  onChange={(e) => setNewStart(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Time *</Label>
                <Input 
                  id="end" 
                  type="time" 
                  value={newEnd} 
                  onChange={(e) => setNewEnd(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={newDept} onValueChange={setNewDept}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Purpose / Notes</Label>
              <Input 
                id="notes" 
                value={newPurpose} 
                onChange={(e) => setNewPurpose(e.target.value)} 
                placeholder="Brief description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Drawer */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader className="mb-6">
            <SheetTitle>Booking Details</SheetTitle>
            <SheetDescription>
              {selectedBooking?.id}
            </SheetDescription>
          </SheetHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Resource Information</h4>
                <div className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium">{selectedBooking.resource}</div>
                  <div className="text-muted-foreground text-xs">{selectedBooking.category}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Booking Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Booked By</span>
                    <span className="font-medium">{selectedBooking.bookedBy} ({selectedBooking.department})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedBooking.date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Time Slot</span>
                    <span className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status</span>
                    <StatusPill status={selectedBooking.status as any} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Booking Timeline</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Booking Created</div>
                      <div className="text-xs text-muted-foreground">{selectedBooking.date} 08:30</div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Booking Confirmed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">Edit</Button>
                <Button variant="outline" className="flex-1">Reschedule</Button>
                <Button variant="destructive" className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Th({
  children,
  sortable,
  className = "",
}: {
  children: React.ReactNode;
  sortable?: boolean;
  className?: string;
}) {
  return (
    <th className={`px-4 py-2.5 text-left font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </th>
  );
}
