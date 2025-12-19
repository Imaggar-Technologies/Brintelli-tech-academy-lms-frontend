import {
  LayoutDashboard,
  UsersRound,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  Award,
  Settings,
  Target,
  FileSearch,
  FileText,
  Handshake,
  Sparkles,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const placementNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/placement/dashboard",
    pageId: "placement-dashboard",
  },
  {
    id: "students",
    label: "Student Management",
    icon: UsersRound,
    children: [
      { label: "All Students", icon: UsersRound, path: "/placement/students", pageId: "placement-students" },
      { label: "Placement Ready", icon: Target, path: "/placement/ready", pageId: "placement-ready" },
      { label: "Candidate Status", icon: FileSearch, path: "/placement/candidate-status", pageId: "placement-status" },
      { label: "Resume Review", icon: FileText, path: "/placement/resume-review", pageId: "placement-resume" },
    ],
  },
  {
    id: "companies",
    label: "Company Management",
    icon: Building2,
    children: [
      { label: "Company List", icon: Building2, path: "/placement/companies", pageId: "placement-companies" },
      { label: "HR Contacts", icon: UsersRound, path: "/placement/hr-contacts", pageId: "placement-hr" },
      { label: "Partnerships", icon: Handshake, path: "/placement/partnerships", pageId: "placement-partnerships" },
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: BriefcaseBusiness,
    children: [
      { label: "Job Opportunities", icon: BriefcaseBusiness, path: "/placement/jobs", pageId: "placement-jobs" },
      { label: "Internship Opportunities", icon: Target, path: "/placement/internships", pageId: "placement-internships" },
      { label: "Opportunity Matching", icon: Sparkles, path: "/placement/matching", pageId: "placement-matching" },
    ],
  },
  {
    id: "interviews",
    label: "Interviews & Assessments",
    icon: CalendarClock,
    children: [
      { label: "Interview Schedule", icon: CalendarClock, path: "/placement/interviews", pageId: "placement-interviews" },
      { label: "Placement Assessments", icon: ClipboardCheck, path: "/placement/assessments", pageId: "placement-assessments" },
      { label: "Interview Feedback", icon: MessageSquare, path: "/placement/feedback", pageId: "placement-feedback" },
    ],
  },
  {
    id: "offers",
    label: "Offers & Outcomes",
    icon: Award,
    children: [
      { label: "Offers Issued", icon: Award, path: "/placement/offers", pageId: "placement-offers" },
      { label: "Offer Tracking", icon: FileSearch, path: "/placement/offer-tracking", pageId: "placement-offer-tracking" },
      { label: "Placement Statistics", icon: BarChart3, path: "/placement/statistics", pageId: "placement-statistics" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/placement/profile", pageId: "placement-profile" },
];

export default placementNav;

