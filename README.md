# Odoo Hackathon 2026 🚀

Welcome to our official repository for the **Odoo Hackathon 2026**! This is a 24-hour intense coding marathon designed to test creativity, problem-solving abilities, and teamwork. 

---

## 👥 Our Team
* **Team Leader:** Ansh yadav
* **Team Members:** 
  * Abhay Kumar
  * Adarsh katara
  * Krishna Gupta

---

## 💡 Selected Problem Statement: AssetFlow
**Enterprise Asset & Resource Management System**

### Overall Vision
The vision for AssetFlow is to simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources through a centralized ERP platform. This is not tied to any single industry; any organization with equipment, furniture, vehicles, or shared spaces (offices, schools, hospitals, factories, agencies) can use it.

The platform aims to reduce manual tracking inefficiencies (spreadsheets, paper logs) by enabling structured asset lifecycles, centralized resource booking, and real-time visibility into who holds what, where it is, and its condition.

AssetFlow focuses on delivering core ERP functionality with clean architecture, role-based workflows, and scalable module design without touching purchasing, invoicing, or accounting concerns.

### Mission
The mission for the hackathon team is to build a user-centric, responsive application that simplifies asset and resource management for any organization. The platform should provide staff with intuitive tools to:
- Set up departments, asset categories, and the employee directory
- Register and track assets through their full lifecycle
- Allocate assets to employees/departments with conflict handling
- Book shared resources (rooms, vehicles, equipment) without overlaps
- Run a structured maintenance approval workflow
- Run structured audit cycles to catch discrepancies
- Get notified of overdue returns, bookings, and maintenance events

### Problem Statement
Design and develop an Enterprise Asset & Resource Management System where organizations can:
- Maintain departments, asset categories, and an employee directory
- Track assets through a flexible lifecycle (including states: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed) where assets can transition between states (e.g., Available ↔ Under Maintenance, Allocated → Available).
- Allocate assets to employees/departments, with the system preventing double-allocation of a single asset
- Book shared/limited resources by time slot, with overlap validation
- Route maintenance requests through an approval workflow before repair work starts
- Run scheduled audit cycles with assigned auditors and auto-generated discrepancy reports
- Surface overdue returns, bookings, and maintenance activity through notifications and a KPI dashboard

### Key Features
1. **Login / Signup Screen**: Authenticate users with realistic, non-self-elevating account creation.
2. **Dashboard / Home Screen**: Give every role a real-time operational snapshot.
3. **Organization Setup Screen**: Maintain the master data everything else depends on (Department, Asset Category, Employee Directory).
4. **Asset Registration & Directory Screen**: Register assets and search/track them centrally.
5. **Asset Allocation & Transfer Screen**: Manage who holds what, with explicit conflict rules.
6. **Resource Booking Screen**: Time-slot booking of shared resources with no overlaps.
7. **Maintenance Management Screen**: Route repairs through approval before work starts.
8. **Asset Audit Screen**: Run structured verification cycles instead of a single form.
9. **Reports & Analytics Screen**: Give managers actionable operational insight.
10. **Activity Logs & Notifications Screen**: Keep every role informed without digging for updates.

### User Roles
- **Admin**: Manages departments, asset categories, audit cycles, and employee/role assignment. Views organization-wide analytics.
- **Asset Manager**: Registers and allocates assets, approves transfers, maintenance requests, and audit discrepancy resolution. Approves asset returns.
- **Department Head**: Views assets allocated to their department, approves allocation/transfer requests within their department, books shared resources on behalf of the department.
- **Employee**: Views assets allocated to them, books shared resources, raises maintenance requests, initiates return/transfer requests.

### Basic Workflow
- Admin sets up departments, asset categories, and promotes select employees to Department Head / Asset Manager.
- Asset Manager registers a new asset, which enters the system as Available.
- Asset is allocated to an employee/department (blocked if already allocated - a transfer request is required instead) or marked as a shared bookable resource.
- Employees book shared resources by time slot; overlapping requests are rejected automatically.
- If an asset needs repair, the holder raises a maintenance request, which must be approved before work begins and before the asset flips to Under Maintenance.
- Assets are transferred or returned as needs change; overdue returns are flagged automatically.
- Periodic audit cycles assign auditors, verify assets, and auto-generate discrepancy reports before closing.
- All activity is tracked through notifications, logs, and reports.

**Mockup (POC) :** [https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby](https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby)

---

## 📅 Timeline & Milestones
- [x] **Assign Evaluator:** 11 Jul, 07:30 PM (Evaluator: `Piyush Soni`)
- [x] **Select Problem Statement:** 12 Jul, 08:30 AM
- [x] **Coding Starts & Repo Submission:** 12 Jul, 09:00 AM 
- [x] **Add Evaluator as Collaborator:** 12 Jul, 10:00 AM *(Deadline to add `piso-odoo` / `hackathon-odoo`)*
- [ ] **Coding Ends:** 12 Jul, 05:00 PM
- [ ] **Video Link Submission:** 12 Jul, 05:45 PM

---

## 🚀 Live Demo & Deployment
- **Firebase Deploy Link:** [https://odoo-hack-bc2bd.web.app/](https://odoo-hack-bc2bd.web.app/)

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Steps to Run
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Access the application:** Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

---

## ✅ What is Implemented

1. **Authentication & Authorization:** 
   - Login, Signup, and Google Authentication integration.
   - Password reset workflow via Firebase.
   - Fully functional role-based access control (Admin, Asset Manager, Department Head, Employee).
2. **Organization Setup:** 
   - Complete management of Departments, Asset Categories, and Employee Directory.
   - Admins can edit employee profiles and instantly promote/demote roles (e.g., promoting an Employee to Asset Manager).
3. **Asset Registration & Allocation:**
   - Asset Managers can register new assets into the system.
   - Robust allocation and return workflows with conflict handling (prevents double allocations).
   - "Direct Transfer" capability for Asset Managers, bypassing the pending request workflow.
   - "Transfer Request" workflow for regular employees.
4. **Dashboard & Tracking:**
   - Real-time operational snapshot and key metrics (Total Assets, Currently Allocated, Under Maintenance, Upcoming Bookings).
   - Automatic flagging and alerting for overdue asset returns.
   - Activity logging for all critical system actions.
