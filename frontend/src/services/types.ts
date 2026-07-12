export type UserRole = "admin" | "asset_manager" | "department_head" | "employee";

export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Reserved"
  | "Under_Maintenance"
  | "Lost"
  | "Retired"
  | "Disposed";

export type AllocationStatus = "Active" | "Returned" | "Overdue";

export type RequestStatus = "Pending" | "Approved" | "Rejected";

export type BookingStatus = "Reserved" | "CheckedIn" | "Completed" | "Cancelled";

export type MaintenancePriority = "Low" | "Medium" | "High" | "Critical";

export type MaintenanceStatus =
  | "Pending_Approval"
  | "Approved"
  | "Rejected"
  | "In_Progress"
  | "Resolved";

export type AuditCycleStatus = "Scheduled" | "In_Progress" | "Completed";

export type AuditStatus = "Verified" | "Discrepancy" | "Missing";

export type AssetCondition = "Good" | "Damaged" | "Fair";

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  departmentId: string | null;
  createdAt: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId: string | null;
  status: "active" | "inactive";
  createdAt: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  warrantyPeriod: string;
  status: "active" | "inactive";
  createdAt: number;
}

export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  categoryId: string;
  description: string;
  status: AssetStatus;
  assignedToId: string | null;
  assignedToName: string | null;
  departmentId: string | null;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor: string;
  location: string;
  createdAt: number;
}

export interface Allocation {
  id: string;
  assetId: string;
  userId: string | null;
  departmentId: string | null;
  type: "user" | "department";
  status: AllocationStatus;
  allocatedById: string;
  allocatedByName: string;
  allocatedAt: number;
  dueDate: number | null;
  returnedAt: number | null;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  requestedById: string;
  status: RequestStatus;
  requestedAt: number;
  actionedAt: number | null;
  actionedById: string | null;
}

export interface Booking {
  id: string;
  assetId: string;
  assetName: string;
  userId: string;
  userName: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  purpose: string;
  status: BookingStatus;
  createdAt: number;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  userId: string;
  userName: string;
  issueDescription: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  cost: number | null;
  createdAt: number;
  actionedById: string | null;
  actionedAt: number | null;
}

export interface AuditCycle {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  status: AuditCycleStatus;
  auditorId: string;
  auditorName: string;
  createdAt: number;
}

export interface AuditRecord {
  id: string;
  auditCycleId: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  auditorId: string;
  status: AuditStatus;
  condition: AssetCondition;
  notes: string;
  verifiedAt: number | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: string;
  createdAt: number;
}
