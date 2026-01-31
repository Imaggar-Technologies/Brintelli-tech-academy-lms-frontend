import Dashboard from "./Dashboard";
import ITManagement from "./ITManagement";
import AllUsers from "./AllUsers";
import RolesManagement from "./RolesManagement";
import AccessControls from "./AccessControls";
import ActivityLogs from "./ActivityLogs";
import Notifications from "./Notifications";

const AdminModulePage = ({ pageId }) => {
  // Route to the appropriate page based on pageId
  if (pageId === "dashboard") {
    return <Dashboard />;
  }

  if (pageId === "it-management") {
    return <ITManagement />;
  }

  if (pageId === "users-all") {
    return <AllUsers />;
  }

  if (pageId === "users-roles") {
    return <RolesManagement />;
  }

  if (pageId === "users-access-controls") {
    return <AccessControls />;
  }

  if (pageId === "users-activity") {
    return <ActivityLogs />;
  }

  if (pageId === "notifications") {
    return <Notifications />;
  }

  // For other pages, you can add more routing logic here
  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-brintelli-border bg-brintelli-card p-10 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-text">Page not found</h2>
        <p className="text-sm text-textMuted">Page ID: {pageId}</p>
      </div>
    </div>
  );
};

export default AdminModulePage;

