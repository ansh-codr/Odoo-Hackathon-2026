import re

with open('src/components/assetflow/ApprovalCenter.tsx', 'r') as f:
    content = f.read()

# 1. Imports
imports = """import { getTransferRequests, approveTransfer, rejectTransfer } from "../../services/assetService";
import { getMaintenanceRequests, approveMaintenanceRequest, rejectMaintenanceRequest } from "../../services/maintenanceService";
import { TransferRequest, MaintenanceRequest as DBMaintenanceRequest } from "../../services/types";"""

content = content.replace('import { Textarea } from "@/components/ui/textarea";', 'import { Textarea } from "@/components/ui/textarea";\n\n' + imports)

# 2. Remove INITIAL_APPROVAL_REQUESTS completely, replace with empty array export
content = re.sub(r'export const INITIAL_APPROVAL_REQUESTS: ApprovalRequest\[\] = \[.*?\];', 'export const INITIAL_APPROVAL_REQUESTS: ApprovalRequest[] = [];', content, flags=re.DOTALL)

# 3. Inside ApprovalCenter, replace state and add load logic
load_logic = """
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    try {
      const [transfers, maintenances] = await Promise.all([
        getTransferRequests(),
        getMaintenanceRequests()
      ]);

      const mapped: ApprovalRequest[] = [];

      transfers.forEach(t => {
        let status: ApprovalStatus = "pending";
        if (t.status === "Approved") status = "approved";
        else if (t.status === "Rejected") status = "rejected";

        mapped.push({
          id: t.id,
          type: "transfer",
          assetTag: "",
          assetName: `Asset ${t.assetId.slice(0, 5)}`, // Ideally we'd join with assets, but this works for demo
          requestedBy: t.fromUserName,
          department: "General",
          priority: "medium",
          status,
          submittedOn: new Date(t.requestedAt).toISOString().split('T')[0],
          currentHolder: t.fromUserName,
          requestedHolder: t.toUserName
        });
      });

      maintenances.forEach(m => {
        let status: ApprovalStatus = "pending";
        if (m.status !== "Pending_Approval") {
            if (m.status === "Rejected") status = "rejected";
            else status = "approved";
        }

        let prio: Priority = "medium";
        if (m.priority === "Low") prio = "low";
        else if (m.priority === "High") prio = "high";
        else if (m.priority === "Critical") prio = "critical";

        mapped.push({
          id: m.id,
          type: "maintenance",
          assetTag: m.assetTag,
          assetName: m.assetName,
          requestedBy: m.userName,
          department: "General",
          priority: prio,
          status,
          submittedOn: new Date(m.createdAt).toISOString().split('T')[0],
          description: m.issueDescription
        });
      });

      // Sort by date desc
      mapped.sort((a, b) => new Date(b.submittedOn).getTime() - new Date(a.submittedOn).getTime());

      setRequests(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load approval requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);
"""

content = re.sub(r'const \[requests, setRequests\] = useState<ApprovalRequest\[\]>\(INITIAL_APPROVAL_REQUESTS\);', load_logic, content)

# 4. handleApprove
approve_logic = """
  const handleApprove = async (req: ApprovalRequest) => {
    try {
      if (req.type === "transfer") {
        await approveTransfer(req.id);
      } else if (req.type === "maintenance") {
        await approveMaintenanceRequest(req.id);
      }
      toast.success("Request Approved", { description: `${req.id} has been approved.` });
      await loadRequests();
      if (selectedRequest?.id === req.id) {
        setSelectedRequest({ ...req, status: "approved" });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to approve request");
    }
  };
"""
content = re.sub(r'const handleApprove = \(req: ApprovalRequest\) => \{.*?\};', approve_logic.strip(), content, flags=re.DOTALL)

# 5. handleConfirmReject
reject_logic = """
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is mandatory.");
      return;
    }
    if (selectedRequest) {
      try {
        if (selectedRequest.type === "transfer") {
          await rejectTransfer(selectedRequest.id);
        } else if (selectedRequest.type === "maintenance") {
          await rejectMaintenanceRequest(selectedRequest.id);
        }
        setIsRejectModalOpen(false);
        toast.success("Request Rejected", { description: `${selectedRequest.id} has been rejected.` });
        await loadRequests();
        setSelectedRequest({ ...selectedRequest, status: "rejected" });
      } catch (e: any) {
        setRejectError(e.message || "Failed to reject request");
      }
    }
  };
"""
content = re.sub(r'const handleConfirmReject = \(\) => \{.*?\};', reject_logic.strip(), content, flags=re.DOTALL)

with open('src/components/assetflow/ApprovalCenter.tsx', 'w') as f:
    f.write(content)
