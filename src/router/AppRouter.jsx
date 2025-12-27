import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AdminLayout from "../components/AdminLayout";
import AdminModulePage from "../pages/adminPortal/AdminModulePage";
import { adminNav } from "../config/adminNav";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

// Auth pages
import SignIn from "../pages/auth/SignIn";
import Register from "../pages/auth/Register";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterStaff from "../pages/auth/RegisterStaff";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChooseRole from "../pages/auth/ChooseRole";
import SwitchUser from "../pages/auth/SwitchUser";

// Student pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentMyCourses from "../pages/student/MyCourses";
import StudentCourseDetail from "../pages/student/CourseDetail";
import StudentLiveClasses from "../pages/student/LiveClasses";
import StudentRecordings from "../pages/student/Recordings";
import StudentAssignments from "../pages/student/Assignments";
import StudentTests from "../pages/student/Tests";
import StudentMockInterviews from "../pages/student/MockInterviews";
import StudentDoubts from "../pages/student/Doubts";
import StudentProfile from "../pages/student/Profile";
import StudentMCQPractice from "../pages/student/MCQPractice";
import StudentCertifications from "../pages/student/CertificationsMock";
import StudentCodePlayground from "../pages/student/CodePlayground";
import StudentPlacementAssistance from "../pages/student/PlacementAssistance";

// Tutor pages
import TutorDashboard from "../pages/tutor/Dashboard";
import TutorManageCourses from "../pages/tutor/ManageCourses";
import TutorLessons from "../pages/tutor/Lessons";
import TutorUploadMaterials from "../pages/tutor/UploadMaterials";
import TutorLiveClassController from "../pages/tutor/LiveClassController";
import TutorStudentsList from "../pages/tutor/StudentsList";
import TutorStudentPerformance from "../pages/tutor/StudentPerformance";

// LSM pages
import LsmDashboard from "../pages/lsm/Dashboard";
import LsmOnboarding from "../pages/lsm/Onboarding";
import LsmMenteesList from "../pages/lsm/MenteesList";
import LsmMenteeProfile from "../pages/lsm/MenteeProfile";
import LsmSessionSchedule from "../pages/lsm/SessionSchedule";
import LsmProgressReports from "../pages/lsm/ProgressReports";
import LsmPlacementTracker from "../pages/lsm/PlacementTracker";
import LsmBatches from "../pages/lsm/Batches";
import LsmBatchSessions from "../pages/lsm/BatchSessions";
import LsmMentors from "../pages/lsm/Mentors";
import RiskStudents from "../pages/lsm/RiskStudents";
import Profiles from "../pages/lsm/Profiles";
import Escalations from "../pages/lsm/Escalations";
import Sessions from "../pages/lsm/Sessions";
import OneOnOne from "../pages/lsm/OneOnOne";
import SessionLogs from "../pages/lsm/SessionLogs";
import Engagement from "../pages/lsm/Engagement";
import Progress from "../pages/lsm/Progress";
import Attendance from "../pages/lsm/Attendance";
import Performance from "../pages/lsm/Performance";
import WeeklyReports from "../pages/lsm/WeeklyReports";
import Readiness from "../pages/lsm/Readiness";
import InterviewPrep from "../pages/lsm/InterviewPrep";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminBatches from "../pages/admin/Batches";
import AdminStudents from "../pages/admin/Students";
import AdminTutors from "../pages/admin/Tutors";
import AdminLsMs from "../pages/admin/LSMs";
import AdminCourses from "../pages/admin/Courses";
import AdminPlacement from "../pages/admin/Placement";
import AdminSettings from "../pages/admin/Settings";

// Placement role pages
import PlacementDashboard from "../pages/placement/PlacementDashboard";

// Mentor dashboard
import MentorDashboard from "../pages/mentor/Dashboard";

// Program manager dashboard
import ProgramManagerDashboard from "../pages/program-manager/Dashboard";
import Programs from "../pages/program-manager/Programs";
import Modules from "../pages/program-manager/Modules";
import AddModules from "../pages/program-manager/AddModules";
import CreateProgram from "../pages/program-manager/CreateProgram";
import ProgramBuilder from "../pages/program-manager/ProgramBuilder";
import ModuleDetails from "../pages/program-manager/ModuleDetails";
import ObjectivesList from "../pages/program-manager/ObjectivesList";
import ObjectiveDetails from "../pages/program-manager/ObjectiveDetails";
import ManageContent from "../pages/program-manager/ManageContent";
import Assignments from "../pages/program-manager/Assignments";
import S3Status from "../pages/program-manager/S3Status";
import Curriculum from "../pages/program-manager/Curriculum";
import Batches from "../pages/program-manager/Batches";
import BatchSessions from "../pages/program-manager/BatchSessions";
import CreateBatch from "../pages/program-manager/CreateBatch";
import FinanceDashboard from "../pages/finance/Dashboard";
import FinanceDeals from "../pages/finance/Deals";
import Scholarships from "../pages/finance/Scholarships";
import FinancialProcessing from "../pages/finance/Processing";
import OutstandingDues from "../pages/finance/Dues";

// Sales imports
import SalesDashboard from "../pages/sales/SalesDashboard";
import ExecutiveDashboard from "../pages/sales/ExecutiveDashboard";
import SalesPipeline from "../pages/sales/Pipeline";
import NewLeadsWrapper from "../pages/sales/NewLeadsWrapper";
import SalesLeads from "../pages/sales/Leads";
import ActiveLeads from "../pages/sales/ActiveLeads";
import LeadsOverview from "../pages/sales/LeadsOverview";
import SalesTasks from "../pages/sales/Tasks";
import SalesQualify from "../pages/sales/Qualify";
import SalesDemos from "../pages/sales/Demos";
import SalesCalendar from "../pages/sales/Calendar";
import SalesFollowUps from "../pages/sales/FollowUps";
import SalesDeals from "../pages/sales/Deals";
import Negotiations from "../pages/sales/Negotiations";
import SalesWon from "../pages/sales/Won";
import SalesLost from "../pages/sales/Lost";
import SalesPartners from "../pages/sales/Partners";
import SalesReferrals from "../pages/sales/Referrals";
import SalesTeam from "../pages/sales/Team";
import Targets from "../pages/sales/Targets";
import TargetsPerformance from "../pages/sales/TargetsPerformance";
import SalesAnalytics from "../pages/sales/Analytics";
import SalesReports from "../pages/sales/Reports";
import BatchCourseMapping from "../pages/sales/BatchCourseMapping";
import SalesProfile from "../pages/sales/Profile";
import MeetingsCounselling from "../pages/sales/MeetingsCounselling";
import Assessments from "../pages/sales/Assessments";
import ScholarshipAndOffers from "../pages/sales/ScholarshipAndOffers";
import SalesFinancialProcessing from "../pages/sales/FinancialProcessing";
import LSMAllocation from "../pages/sales/LSMAllocation";
import OfferPage from "../pages/candidate/OfferPage";
import SalesNotifications from "../pages/sales/Notifications";

// Marketing imports
import MarketingDashboard from "../pages/marketing/Dashboard";
import MarketingCampaigns from "../pages/marketing/Campaigns";
import MarketingCampaignBuilder from "../pages/marketing/CampaignBuilder";
import MarketingCampaignPerformance from "../pages/marketing/CampaignPerformance";
import MarketingSocial from "../pages/marketing/Social";
import MarketingCalendar from "../pages/marketing/MarketingCalendar";
import MarketingEngagement from "../pages/marketing/Engagement";
import MarketingFunnels from "../pages/marketing/Funnels";
import MarketingConversions from "../pages/marketing/Conversions";
import MarketingABTesting from "../pages/marketing/ABTesting";
import MarketingAssets from "../pages/marketing/Assets";
import MarketingTemplates from "../pages/marketing/Templates";
import MarketingBrand from "../pages/marketing/Brand";
import MarketingAnalytics from "../pages/marketing/MarketingAnalytics";
import MarketingROI from "../pages/marketing/ROI";
import MarketingAttribution from "../pages/marketing/Attribution";
import MarketingProfile from "../pages/marketing/Profile";

// External HR imports
import ExternalHrDashboard from "../pages/externalHr/Dashboard";
import ExternalHrPipeline from "../pages/externalHr/Pipeline";
import ExternalHrNewApplications from "../pages/externalHr/NewApplications";
import ExternalHrShortlisted from "../pages/externalHr/Shortlisted";
import ExternalHrCandidates from "../pages/externalHr/Candidates";
import ExternalHrSkillsMatrix from "../pages/externalHr/SkillsMatrix";
import ExternalHrResumes from "../pages/externalHr/Resumes";
import ExternalHrInterviewSchedule from "../pages/externalHr/InterviewSchedule";
import ExternalHrFeedback from "../pages/externalHr/Feedback";
import ExternalHrInterviewHistory from "../pages/externalHr/InterviewHistory";
import ExternalHrSubmitRoles from "../pages/externalHr/SubmitRoles";
import ExternalHrJDUpload from "../pages/externalHr/JDUpload";
import ExternalHrRequirements from "../pages/externalHr/Requirements";
import ExternalHrOffers from "../pages/externalHr/Offers";
import ExternalHrOfferStatus from "../pages/externalHr/OfferStatus";
import ExternalHrJoining from "../pages/externalHr/Joining";
import ExternalHrConversion from "../pages/externalHr/Conversion";
import ExternalHrSuccessScore from "../pages/externalHr/SuccessScore";
import ExternalHrReports from "../pages/externalHr/Reports";
import ExternalHrProfile from "../pages/externalHr/Profile";

const NotFound = () => (
  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-brintelli-border bg-brintelli-card p-10 text-center">
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-text">Page not found</h2>
      <p className="text-sm text-textMuted">Please select a module using the sidebar navigation.</p>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route - SwitchUser page (public, handles auth check internally) */}
        <Route path="/" element={<SwitchUser />} />
        <Route path="switch-user" element={<SwitchUser />} />
        
        {/* Auth routes - only accessible when NOT logged in */}
        <Route path="/auth">
          <Route path="signin" element={<PublicRoute><SignIn /></PublicRoute>} />
          <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="register/student" element={<PublicRoute><RegisterStudent /></PublicRoute>} />
          <Route path="register/staff" element={<PublicRoute><RegisterStaff /></PublicRoute>} />
          <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="offer/:offerId" element={<PublicRoute><OfferPage /></PublicRoute>} />
          <Route path="choose-role" element={<ChooseRole />} />
          <Route path="select-user" element={<ChooseRole />} />
        </Route>
        
        {/* Admin portal routes - protected */}
        <Route path="/admin-portal" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminModulePage pageId="dashboard" />} />
          {adminNav.flatMap((item) => {
            if (item.children) {
              return item.children.map((child) => {
                const relativePath = child.path.replace("/admin-portal/", "");
                return (
                  <Route
                    key={child.path}
                    path={relativePath}
                    element={<AdminModulePage pageId={child.pageId} />}
                  />
                );
              });
            }
            if (item.pageId && item.path !== "/admin-portal/dashboard") {
              const relativePath = item.path.replace("/admin-portal/", "");
              return (
                <Route
                  key={item.path}
                  path={relativePath}
                  element={<AdminModulePage pageId={item.pageId} />}
                />
              );
            }
            return null;
          })}
        </Route>
        <Route path="/admin/*" element={<Navigate to="/admin-portal/dashboard" replace />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/student/dashboard" replace />} />

          <Route path="student">
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-courses" element={<StudentMyCourses />} />
            <Route path="course/:id" element={<StudentCourseDetail />} />
            <Route path="live-classes" element={<StudentLiveClasses />} />
            <Route path="recordings" element={<StudentRecordings />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="tests" element={<StudentTests />} />
            <Route path="mock-interviews" element={<StudentMockInterviews />} />
            <Route path="doubts" element={<StudentDoubts />} />
            <Route path="mcq-practice" element={<StudentMCQPractice />} />
            <Route path="certifications" element={<StudentCertifications />} />
            <Route path="code-playground" element={<StudentCodePlayground />} />
            <Route path="placement-assistance" element={<StudentPlacementAssistance />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          <Route path="tutor">
            <Route path="dashboard" element={<TutorDashboard />} />
            <Route path="manage-courses" element={<TutorManageCourses />} />
            <Route path="lessons" element={<TutorLessons />} />
            <Route path="upload-materials" element={<TutorUploadMaterials />} />
            <Route path="live" element={<TutorLiveClassController />} />
            <Route path="live-class-controller" element={<TutorLiveClassController />} />
            <Route path="students" element={<TutorStudentsList />} />
            <Route path="student-performance" element={<TutorStudentPerformance />} />
          </Route>

          <Route path="lsm">
            <Route path="dashboard" element={<LsmDashboard />} />
            <Route path="onboarding" element={<LsmOnboarding />} />
            <Route path="batches" element={<LsmBatches />} />
            <Route path="batches/:batchId/sessions" element={<LsmBatchSessions />} />
            <Route path="batches/:batchId/students" element={<LsmBatches />} />
            <Route path="mentors" element={<LsmMentors />} />
            <Route path="mentees" element={<LsmMenteesList />} />
            <Route path="mentee/:id" element={<LsmMenteeProfile />} />
            <Route path="session-schedule" element={<LsmSessionSchedule />} />
            <Route path="progress-reports" element={<LsmProgressReports />} />
            <Route path="placement-tracker" element={<LsmPlacementTracker />} />
            <Route path="risk-students" element={<RiskStudents />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="escalations" element={<Escalations />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="one-on-one" element={<OneOnOne />} />
            <Route path="session-logs" element={<SessionLogs />} />
            <Route path="engagement" element={<Engagement />} />
            <Route path="progress" element={<Progress />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="performance" element={<Performance />} />
            <Route path="weekly-reports" element={<WeeklyReports />} />
            <Route path="readiness" element={<Readiness />} />
            <Route path="interview-prep" element={<InterviewPrep />} />
          </Route>

          <Route path="placement">
            <Route path="dashboard" element={<PlacementDashboard />} />
          </Route>

          <Route path="mentor">
            <Route path="dashboard" element={<MentorDashboard />} />
          </Route>

          <Route path="program-manager">
            <Route path="dashboard" element={<ProgramManagerDashboard />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/create" element={<CreateProgram />} />
            <Route path="programs/create/:programId" element={<CreateProgram />} />
            <Route path="programs/builder/:programId" element={<ProgramBuilder />} />
            <Route path="programs/:programId/modules/new" element={<ModuleDetails />} />
            <Route path="programs/:programId/modules/:moduleId" element={<ModuleDetails />} />
            <Route path="programs/:programId/modules/:moduleId/objectives" element={<ObjectivesList />} />
            <Route path="programs/:programId/modules/:moduleId/objectives/new" element={<ObjectiveDetails />} />
            <Route path="programs/:programId/modules/:moduleId/objectives/:objectiveIndex" element={<ObjectiveDetails />} />
            <Route path="programs/:programId/modules/:moduleId/objectives/:objectiveId/content" element={<ManageContent />} />
            <Route path="programs/:programId/add-modules" element={<AddModules />} />
            <Route path="modules/:programId" element={<Modules />} />
            <Route path="modules/:programId/assignments/:moduleId" element={<Assignments />} />
            <Route path="s3-status" element={<S3Status />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="batches" element={<Batches />} />
            <Route path="batches/:batchId/sessions" element={<BatchSessions />} />
            <Route path="batches/create" element={<CreateBatch />} />
            <Route path="batches/create/:programId" element={<CreateBatch />} />
          </Route>

          <Route path="finance">
            <Route path="dashboard" element={<FinanceDashboard />} />
            <Route path="processing" element={<FinancialProcessing />} />
            <Route path="deals" element={<FinanceDeals />} />
            <Route path="scholarships" element={<Scholarships />} />
            <Route path="dues" element={<OutstandingDues />} />
          </Route>

          {/* Sales routes */}
          <Route path="sales">
            <Route path="dashboard" element={<SalesDashboard />} />
            <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
            <Route path="pipeline" element={<SalesPipeline />} />
            <Route path="new-leads" element={<NewLeadsWrapper />} />
            <Route path="leads" element={<SalesLeads />} />
            <Route path="active-leads" element={<ActiveLeads />} />
            <Route path="leads-overview" element={<LeadsOverview />} />
            <Route path="meetings-counselling" element={<MeetingsCounselling />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="scholarship-and-offers" element={<ScholarshipAndOffers />} />
            <Route path="deals" element={<SalesDeals />} />
            <Route path="negotiations" element={<Negotiations />} />
            <Route path="won-deals" element={<SalesWon />} />
            <Route path="lost-deals" element={<SalesLost />} />
            <Route path="team" element={<SalesTeam />} />
            <Route path="targets" element={<Targets />} />
            <Route path="targets-performance" element={<TargetsPerformance />} />
            <Route path="financial-processing" element={<SalesFinancialProcessing />} />
            <Route path="batch-course-mapping" element={<BatchCourseMapping />} />
            <Route path="reports-analytics" element={<SalesReports />} />
            <Route path="tasks" element={<SalesTasks />} />
            <Route path="profile" element={<SalesProfile />} />
            {/* Legacy routes for backward compatibility */}
            <Route path="won" element={<Navigate to="won-deals" replace />} />
            <Route path="lost" element={<Navigate to="lost-deals" replace />} />
            <Route path="reports" element={<Navigate to="reports-analytics" replace />} />
            <Route path="analytics" element={<Navigate to="reports-analytics" replace />} />
            <Route path="qualify" element={<SalesQualify />} />
            <Route path="demos" element={<SalesDemos />} />
            <Route path="calendar" element={<SalesCalendar />} />
            <Route path="follow-ups" element={<SalesFollowUps />} />
            <Route path="partners" element={<SalesPartners />} />
            <Route path="referrals" element={<SalesReferrals />} />
            <Route path="lsm-allocation" element={<LSMAllocation />} />
            <Route path="notifications" element={<SalesNotifications />} />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<SalesDashboard />} />
          </Route>

          {/* Marketing routes */}
          <Route path="marketing">
            <Route path="dashboard" element={<MarketingDashboard />} />
            <Route path="campaigns" element={<MarketingCampaigns />} />
            <Route path="campaign-builder" element={<MarketingCampaignBuilder />} />
            <Route path="campaign-performance" element={<MarketingCampaignPerformance />} />
            <Route path="social" element={<MarketingSocial />} />
            <Route path="calendar" element={<MarketingCalendar />} />
            <Route path="engagement" element={<MarketingEngagement />} />
            <Route path="funnels" element={<MarketingFunnels />} />
            <Route path="conversions" element={<MarketingConversions />} />
            <Route path="ab-testing" element={<MarketingABTesting />} />
            <Route path="assets" element={<MarketingAssets />} />
            <Route path="templates" element={<MarketingTemplates />} />
            <Route path="brand" element={<MarketingBrand />} />
            <Route path="analytics" element={<MarketingAnalytics />} />
            <Route path="roi" element={<MarketingROI />} />
            <Route path="attribution" element={<MarketingAttribution />} />
            <Route path="profile" element={<MarketingProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<MarketingDashboard />} />
          </Route>

          {/* External HR routes */}
          <Route path="external-hr">
            <Route path="dashboard" element={<ExternalHrDashboard />} />
            <Route path="pipeline" element={<ExternalHrPipeline />} />
            <Route path="new-applications" element={<ExternalHrNewApplications />} />
            <Route path="shortlisted" element={<ExternalHrShortlisted />} />
            <Route path="candidates" element={<ExternalHrCandidates />} />
            <Route path="skills-matrix" element={<ExternalHrSkillsMatrix />} />
            <Route path="resumes" element={<ExternalHrResumes />} />
            <Route path="interview-schedule" element={<ExternalHrInterviewSchedule />} />
            <Route path="feedback" element={<ExternalHrFeedback />} />
            <Route path="interview-history" element={<ExternalHrInterviewHistory />} />
            <Route path="submit-roles" element={<ExternalHrSubmitRoles />} />
            <Route path="jd-upload" element={<ExternalHrJDUpload />} />
            <Route path="requirements" element={<ExternalHrRequirements />} />
            <Route path="offers" element={<ExternalHrOffers />} />
            <Route path="offer-status" element={<ExternalHrOfferStatus />} />
            <Route path="joining" element={<ExternalHrJoining />} />
            <Route path="conversion" element={<ExternalHrConversion />} />
            <Route path="success-score" element={<ExternalHrSuccessScore />} />
            <Route path="reports" element={<ExternalHrReports />} />
            <Route path="profile" element={<ExternalHrProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<ExternalHrDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

