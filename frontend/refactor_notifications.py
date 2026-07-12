import re

# 1. Update notificationService.ts
with open('src/services/notificationService.ts', 'r') as f:
    ns_content = f.read()

if 'deleteNotification' not in ns_content:
    ns_content = ns_content.replace('import { \n  collection, \n  getDocs, \n  setDoc, \n  doc, \n  updateDoc, \n  query, \n  where, \n  orderBy,\n  addDoc\n} from "firebase/firestore";', 'import { \n  collection, \n  getDocs, \n  setDoc, \n  doc, \n  updateDoc, \n  deleteDoc, \n  query, \n  where, \n  orderBy,\n  addDoc\n} from "firebase/firestore";')
    ns_content += """

export async function deleteNotification(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId);
  await deleteDoc(docRef);
}
"""
    with open('src/services/notificationService.ts', 'w') as f:
        f.write(ns_content)


# 2. Update NotificationsLogs.tsx
with open('src/components/assetflow/NotificationsLogs.tsx', 'r') as f:
    nl_content = f.read()

imports = """import { getNotifications, markAsRead as markNotifRead, deleteNotification as delNotif } from "../../services/notificationService";
import { getActivityLogs } from "../../services/logService";
import { auth } from "../../lib/firebase";"""

nl_content = nl_content.replace('import { type Role } from "./Sidebar";', 'import { type Role } from "./Sidebar";\n' + imports)

# Remove mock data arrays completely
nl_content = re.sub(r'export const MOCK_NOTIFICATIONS: AppNotification\[\] = \[.*?\];', 'export const MOCK_NOTIFICATIONS: AppNotification[] = [];', nl_content, flags=re.DOTALL)
nl_content = re.sub(r'const MOCK_LOGS: ActivityLog\[\] = \[.*?\];', 'const MOCK_LOGS: ActivityLog[] = [];', nl_content, flags=re.DOTALL)

# Update the component body
state_logic = """
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const canViewLogs = role === "admin" || role === "asset_manager" || role === "department_head";

  async function loadData() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const notifs = await getNotifications(user.uid);
      setNotifications(notifs);

      if (canViewLogs) {
        const logs = await getActivityLogs();
        setActivityLogs(logs);
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    loadData();
  }, [activeTab, canViewLogs]);

  const unreadCount = notifications.filter(
"""

nl_content = re.sub(r'const \[activeTab, setActiveTab\] = useState\("notifications"\);\n  const \[notifications, setNotifications\] = useState\(MOCK_NOTIFICATIONS\);\n  const \[selectedLog, setSelectedLog\] = useState<ActivityLog \| null>\(null\);\n\n  const canViewLogs = role === "admin" \|\| role === "asset_manager" \|\| role === "department_head";\n\n  const unreadCount = notifications.filter\(', state_logic.strip() + '\n', nl_content)


mark_logic = """
  const markAllRead = async () => {
    try {
      const unreads = notifications.filter(n => !n.isRead);
      await Promise.all(unreads.map(n => markNotifRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch(e) {}
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotifRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch(e) {}
  };

  const deleteNotification = async (id: string) => {
    try {
      await delNotif(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch(e) {}
  };
"""

# Now handle the replacement of all 3 functions at once.
# In original code, the 3 functions are consecutive. Let's just find `const markAllRead = () => {` until `toast.success("Notification deleted");\n  };`

nl_content = re.sub(r'const markAllRead = \(\) => \{.*?\n  \};.*?const markAsRead = \(id: string\) => \{.*?\n  \};.*?const deleteNotification = \(id: string\) => \{.*?\n  \};', mark_logic.strip(), nl_content, flags=re.DOTALL)

# Fix the mapping of logs variable in table
nl_content = nl_content.replace('MOCK_LOGS.map(log => (', 'activityLogs.map(log => (')


with open('src/components/assetflow/NotificationsLogs.tsx', 'w') as f:
    f.write(nl_content)

