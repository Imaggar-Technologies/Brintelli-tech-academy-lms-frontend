import Dashboard from "./Dashboard";
import ITManagement from "./ITManagement";
import AllUsers from "./AllUsers";
import RolesManagement from "./RolesManagement";
import AccessControls from "./AccessControls";
import ActivityLogs from "./ActivityLogs";
import UserActivityPage from "./UserActivityPage";
import Notifications from "./Notifications";
import AdminWorkshops from "./AdminWorkshops";
import CmsSeoPage from "./websiteCms/CmsSeoPage";
import CmsProgramsList from "./websiteCms/CmsProgramsList";
import CmsEventsList from "./websiteCms/CmsEventsList";
import CmsTestimonialsList from "./websiteCms/CmsTestimonialsList";
import CmsBlogsList from "./websiteCms/CmsBlogsList";
import CmsBannersList from "./websiteCms/CmsBannersList";
import CmsGalleryEdit from "./websiteCms/CmsGalleryEdit";
import CmsPopupsList from "./websiteCms/CmsPopupsList";
import CmsMediaList from "./websiteCms/CmsMediaList";

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

  if (pageId === "users-learner-activity") {
    return <UserActivityPage />;
  }

  if (pageId === "notifications") {
    return <Notifications />;
  }

  if (pageId === "admin-workshops") {
    return <AdminWorkshops />;
  }

  if (pageId === "website-cms-seo") return <CmsSeoPage />;
  if (pageId === "website-cms-programs") return <CmsProgramsList />;
  if (pageId === "website-cms-events") return <CmsEventsList />;
  if (pageId === "website-cms-testimonials") return <CmsTestimonialsList />;
  if (pageId === "website-cms-blogs") return <CmsBlogsList />;
  if (pageId === "website-cms-banners") return <CmsBannersList />;
  if (pageId === "website-cms-gallery") return <CmsGalleryEdit />;
  if (pageId === "website-cms-popups") return <CmsPopupsList />;
  if (pageId === "website-cms-media") return <CmsMediaList />;

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

