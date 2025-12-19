 import {
  LayoutDashboard,
  BriefcaseBusiness,
  UserCheck,
  CalendarClock,
  FileText,
  Award,
  BarChart3,
  Settings,
  Target,
  Layers3,
  Upload,
  FileSearch,
  ClipboardCheck,
  FileBarChart,
  FileSpreadsheet,
} from "lucide-react";

const externalHrNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/external-hr/dashboard",
    pageId: "external-hr-dashboard",
  },
  {
    id: "pipeline",
    label: "Pipeline Overview",
    icon: BriefcaseBusiness,
    children: [
      { label: "Pipeline Dashboard", icon: BarChart3, path: "/external-hr/pipeline", pageId: "external-hr-pipeline" },
      { label: "New Applications", icon: Target, path: "/external-hr/new-applications", pageId: "external-hr-new" },
      { label: "Shortlisted Students", icon: UserCheck, path: "/external-hr/shortlisted", pageId: "external-hr-shortlisted" },
    ],
  },
  {
    id: "candidates",
    label: "Candidates",
    icon: UserCheck,
    children: [
      { label: "Candidate Profiles", icon: UserCheck, path: "/external-hr/candidates", pageId: "external-hr-candidates" },
      { label: "Skills Matrix", icon: Layers3, path: "/external-hr/skills-matrix", pageId: "external-hr-skills" },
      { label: "Resume Viewer", icon: FileText, path: "/external-hr/resumes", pageId: "external-hr-resumes" },
    ],
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: CalendarClock,
    children: [
      { label: "Interview Scheduling", icon: CalendarClock, path: "/external-hr/interview-schedule", pageId: "external-hr-schedule" },
      { label: "Feedback & Rating", icon: ClipboardCheck, path: "/external-hr/feedback", pageId: "external-hr-feedback" },
      { label: "Interview History", icon: FileSearch, path: "/external-hr/interview-history", pageId: "external-hr-history" },
    ],
  },
  {
    id: "requirements",
    label: "Requirements Intake",
    icon: FileText,
    children: [
      { label: "Submit Job Roles", icon: FileText, path: "/external-hr/submit-roles", pageId: "external-hr-submit" },
      { label: "JD Upload", icon: Upload, path: "/external-hr/jd-upload", pageId: "external-hr-jd" },
      { label: "Open Requirements Status", icon: FileSearch, path: "/external-hr/requirements", pageId: "external-hr-requirements" },
    ],
  },
  {
    id: "offers",
    label: "Offers & Result Closure",
    icon: Award,
    children: [
      { label: "Offers Issued", icon: Award, path: "/external-hr/offers", pageId: "external-hr-offers" },
      { label: "Offer Accept/Reject Status", icon: ClipboardCheck, path: "/external-hr/offer-status", pageId: "external-hr-offer-status" },
      { label: "Joining Confirmation", icon: UserCheck, path: "/external-hr/joining", pageId: "external-hr-joining" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Conversion Metrics", icon: BarChart3, path: "/external-hr/conversion", pageId: "external-hr-conversion" },
      { label: "Hiring Success Score", icon: FileBarChart, path: "/external-hr/success-score", pageId: "external-hr-success" },
      { label: "Hiring Reports", icon: FileSpreadsheet, path: "/external-hr/reports", pageId: "external-hr-reports" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/external-hr/profile", pageId: "external-hr-profile" },
];

export default externalHrNav;

