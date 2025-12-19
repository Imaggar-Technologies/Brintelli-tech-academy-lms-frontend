import Dashboard from "./Dashboard";

const AdminModulePage = ({ pageId }) => {
  // Route to the appropriate page based on pageId
  if (pageId === "dashboard") {
    return <Dashboard />;
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

