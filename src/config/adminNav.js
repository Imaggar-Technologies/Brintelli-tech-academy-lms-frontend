import {
  LayoutDashboard,
  GraduationCap,
  CalendarRange,
  BookOpenCheck,
  ClipboardCheck,
  Users2,
  FolderKanban,
  Video,
  FileText,
  Layers3,
  ListChecks,
  Target,
  BadgeCheck,
  BriefcaseBusiness,
  Handshake,
  Code2,
  Award,
  Wallet,
  ShieldCheck,
  Bell,
  BarChart3,
  Settings,
  UserCog,
  Building2,
  Sparkles,
  CalendarClock,
  MonitorPlay,
  MessageSquare,
  ChartSpline,
  FileSpreadsheet,
  UsersRound,
  Wrench,
} from "lucide-react";

export const adminNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin-portal/dashboard",
    pageId: "dashboard",
  },
  {
    id: "lms",
    label: "LMS Management",
    icon: GraduationCap,
    children: [
      { label: "Programs", icon: Layers3, path: "/admin-portal/lms/programs", pageId: "lms-programs" },
      { label: "Curriculum Builder", icon: BookOpenCheck, path: "/admin-portal/lms/curriculum-builder", pageId: "lms-curriculum" },
      { label: "Batch Management", icon: FolderKanban, path: "/admin-portal/lms/batch-management", pageId: "lms-batches" },
      { label: "Schedule Planner", icon: CalendarClock, path: "/admin-portal/lms/schedule-planner", pageId: "lms-schedule" },
      { label: "Live Classes Monitor", icon: MonitorPlay, path: "/admin-portal/lms/live-classes-monitor", pageId: "lms-live-monitor" },
      { label: "Tutors", icon: Users2, path: "/admin-portal/lms/tutors", pageId: "lms-tutors" },
      { label: "Notes / Quizzes / Poll Approvals", icon: ClipboardCheck, path: "/admin-portal/lms/content-approvals", pageId: "lms-content-approvals" },
      { label: "Learning Paths", icon: Layers3, path: "/admin-portal/lms/learning-paths", pageId: "lms-learning-paths" },
      { label: "Recordings Library", icon: Video, path: "/admin-portal/lms/recordings-library", pageId: "lms-recordings" },
    ],
  },
  {
    id: "program-manager",
    label: "Program Manager Hub",
    icon: CalendarRange,
    children: [
      { label: "Syllabus Planner", icon: CalendarRange, path: "/admin-portal/program-manager/syllabus-planner", pageId: "pm-syllabus" },
      { label: "Weekly Class Plans", icon: CalendarClock, path: "/admin-portal/program-manager/weekly-plans", pageId: "pm-weekly-plans" },
      { label: "Tutor Content Review", icon: ClipboardCheck, path: "/admin-portal/program-manager/tutor-content-review", pageId: "pm-content-review" },
      { label: "Assessment Builder", icon: FileSpreadsheet, path: "/admin-portal/program-manager/assessment-builder", pageId: "pm-assessment-builder" },
      { label: "Lesson Quality Reports", icon: ChartSpline, path: "/admin-portal/program-manager/lesson-quality-reports", pageId: "pm-lesson-quality" },
    ],
  },
  {
    id: "sales",
    label: "Sales & CRM",
    icon: BriefcaseBusiness,
    children: [
      { label: "Lead Manager", icon: UsersRound, path: "/admin-portal/sales-crm/lead-manager", pageId: "sales-leads" },
      { label: "Counselling Pipeline", icon: MessageSquare, path: "/admin-portal/sales-crm/counselling-pipeline", pageId: "sales-counselling" },
      { label: "Demo Scheduling", icon: CalendarClock, path: "/admin-portal/sales-crm/demo-scheduling", pageId: "sales-demo" },
      { label: "Interview Pipeline", icon: Target, path: "/admin-portal/sales-crm/interview-pipeline", pageId: "sales-interview" },
      { label: "Assessment Pipeline", icon: ListChecks, path: "/admin-portal/sales-crm/assessment-pipeline", pageId: "sales-assessment" },
      { label: "Final Approval Round", icon: ShieldCheck, path: "/admin-portal/sales-crm/final-approval", pageId: "sales-final-round" },
      { label: "Offer Letters Generator", icon: FileText, path: "/admin-portal/sales-crm/offer-letters", pageId: "sales-offer-letters" },
      { label: "Sales Dashboard & KPIs", icon: BarChart3, path: "/admin-portal/sales-crm/dashboard", pageId: "sales-dashboard" },
    ],
  },
  {
    id: "mentor-lsp",
    label: "Mentor & LSP Management",
    icon: Users2,
    children: [
      { label: "Mentor Directory", icon: GraduationCap, path: "/admin-portal/mentor-lsp/mentor-directory", pageId: "mentor-directory" },
      { label: "LSP Manager Directory", icon: Users2, path: "/admin-portal/mentor-lsp/lsp-directory", pageId: "mentor-lsp-directory" },
      { label: "1:1 Session Logs", icon: MessageSquare, path: "/admin-portal/mentor-lsp/session-logs", pageId: "mentor-session-logs" },
      { label: "Student Escalations", icon: Target, path: "/admin-portal/mentor-lsp/student-escalations", pageId: "mentor-escalations" },
      { label: "Engagement Metrics", icon: ChartSpline, path: "/admin-portal/mentor-lsp/engagement-metrics", pageId: "mentor-engagement" },
      { label: "Weekly/Monthly Reports", icon: FileText, path: "/admin-portal/mentor-lsp/reports", pageId: "mentor-reports" },
      { label: "Mentor/LSP Performance", icon: BadgeCheck, path: "/admin-portal/mentor-lsp/performance", pageId: "mentor-performance" },
    ],
  },
  {
    id: "placement",
    label: "Placement & Internship Cell",
    icon: Target,
    children: [
      { label: "Internship Pipeline", icon: BriefcaseBusiness, path: "/admin-portal/placement/internship-pipeline", pageId: "placement-internship" },
      { label: "Job Pipeline", icon: BriefcaseBusiness, path: "/admin-portal/placement/job-pipeline", pageId: "placement-job" },
      { label: "Placement Assessments", icon: ClipboardCheck, path: "/admin-portal/placement/assessments", pageId: "placement-assessments" },
      { label: "Interview Schedules", icon: CalendarClock, path: "/admin-portal/placement/interview-schedules", pageId: "placement-interviews" },
      { label: "Candidate Status", icon: Users2, path: "/admin-portal/placement/candidate-status", pageId: "placement-candidate-status" },
      { label: "Offers Issued", icon: FileText, path: "/admin-portal/placement/offers-issued", pageId: "placement-offers" },
      { label: "Company Feedback", icon: MessageSquare, path: "/admin-portal/placement/company-feedback", pageId: "placement-feedback" },
    ],
  },
  {
    id: "hr",
    label: "HR & Partnerships",
    icon: Handshake,
    children: [
      { label: "Partner Companies Directory", icon: Building2, path: "/admin-portal/hr/partners", pageId: "hr-partners" },
      { label: "HR Contacts", icon: UsersRound, path: "/admin-portal/hr/contacts", pageId: "hr-contacts" },
      { label: "Internship Opportunities", icon: BriefcaseBusiness, path: "/admin-portal/hr/internship-opportunities", pageId: "hr-internships" },
      { label: "Job Opportunities", icon: BriefcaseBusiness, path: "/admin-portal/hr/job-opportunities", pageId: "hr-jobs" },
      { label: "HR Communication Logs", icon: MessageSquare, path: "/admin-portal/hr/communication-logs", pageId: "hr-communications" },
      { label: "Candidate Shortlists", icon: Users2, path: "/admin-portal/hr/candidate-shortlists", pageId: "hr-shortlists" },
      { label: "MoUs / Agreements", icon: FileText, path: "/admin-portal/hr/mous", pageId: "hr-mous" },
      { label: "Company Performance Analytics", icon: BarChart3, path: "/admin-portal/hr/company-analytics", pageId: "hr-analytics" },
    ],
  },
  {
    id: "practice",
    label: "Practice Engine",
    icon: Code2,
    children: [
      { label: "Mandatory Assignments", icon: ClipboardCheck, path: "/admin-portal/practice/mandatory-assignments", pageId: "practice-mandatory" },
      { label: "Coding Challenges (DSA)", icon: Code2, path: "/admin-portal/practice/coding-challenges", pageId: "practice-coding" },
      { label: "Extra Practice Problems", icon: ListChecks, path: "/admin-portal/practice/extra-problems", pageId: "practice-extra" },
      { label: "Weekly Practice Sheets", icon: FileText, path: "/admin-portal/practice/weekly-sheets", pageId: "practice-weekly" },
      { label: "Test Case Builder", icon: Layers3, path: "/admin-portal/practice/test-case-builder", pageId: "practice-test-cases" },
      { label: "Student Submission Tracker", icon: ChartSpline, path: "/admin-portal/practice/submission-tracker", pageId: "practice-submissions" },
      { label: "Plagiarism Checker", icon: ShieldCheck, path: "/admin-portal/practice/plagiarism-checker", pageId: "practice-plagiarism" },
    ],
  },
  {
    id: "certifications",
    label: "Certifications Center",
    icon: Award,
    children: [
      { label: "Certification Exams", icon: Award, path: "/admin-portal/certifications/certification-exams", pageId: "certification-exams" },
      { label: "Mock Examinations", icon: ClipboardCheck, path: "/admin-portal/certifications/mock-exams", pageId: "certification-mocks" },
      { label: "Exam Scheduling", icon: CalendarClock, path: "/admin-portal/certifications/exam-scheduling", pageId: "certification-scheduling" },
      { label: "Difficulty Levels", icon: Layers3, path: "/admin-portal/certifications/difficulty-levels", pageId: "certification-difficulty" },
      { label: "Auto-Grading System", icon: Sparkles, path: "/admin-portal/certifications/auto-grading", pageId: "certification-auto-grading" },
      { label: "Results & Scorecards", icon: FileSpreadsheet, path: "/admin-portal/certifications/results", pageId: "certification-results" },
      { label: "Certificate Generator", icon: Award, path: "/admin-portal/certifications/certificate-generator", pageId: "certification-generator" },
    ],
  },
  {
    id: "finance",
    label: "Finance & Revenue",
    icon: Wallet,
    children: [
      { label: "Payments & Transactions", icon: Wallet, path: "/admin-portal/finance/payments", pageId: "finance-payments" },
      { label: "Fee Receipts", icon: FileText, path: "/admin-portal/finance/fee-receipts", pageId: "finance-fee-receipts" },
      { label: "Outstanding Dues", icon: Target, path: "/admin-portal/finance/outstanding-dues", pageId: "finance-dues" },
      { label: "Course Revenue Breakdown", icon: BarChart3, path: "/admin-portal/finance/course-revenue", pageId: "finance-course-revenue" },
      { label: "Batch Revenue", icon: ChartSpline, path: "/admin-portal/finance/batch-revenue", pageId: "finance-batch-revenue" },
      { label: "Scholarships & Discounts", icon: Sparkles, path: "/admin-portal/finance/scholarships", pageId: "finance-scholarships" },
      { label: "Refund Requests", icon: ClipboardCheck, path: "/admin-portal/finance/refunds", pageId: "finance-refunds" },
      { label: "EMI Management", icon: CalendarClock, path: "/admin-portal/finance/emi-management", pageId: "finance-emi" },
      { label: "Monthly/Yearly Revenue Analytics", icon: BarChart3, path: "/admin-portal/finance/revenue-analytics", pageId: "finance-analytics" },
    ],
  },
  {
    id: "it-management",
    label: "IT Management",
    icon: Wrench,
    path: "/admin-portal/it-management",
    pageId: "it-management",
  },
  {
    id: "users",
    label: "User & Roles Management",
    icon: UserCog,
    children: [
      { label: "All Users", icon: UsersRound, path: "/admin-portal/users/all", pageId: "users-all" },
      { label: "Role Management", icon: UserCog, path: "/admin-portal/users/roles", pageId: "users-roles" },
      { label: "Access Controls (RBAC)", icon: ShieldCheck, path: "/admin-portal/users/access-controls", pageId: "users-access-controls" },
      { label: "Activity Logs", icon: ClipboardCheck, path: "/admin-portal/users/activity-logs", pageId: "users-activity" },
    ],
  },
  { id: "notifications", label: "Notifications & Broadcasts", icon: Bell, path: "/admin-portal/notifications", pageId: "notifications" },
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3, path: "/admin-portal/analytics", pageId: "analytics" },
  { id: "settings", label: "App Settings", icon: Settings, path: "/admin-portal/settings", pageId: "settings" },
];

export const adminModuleConfig = {
  dashboard: {
    title: "Admin Command Center",
    description: "Visibility across academics, placements, partnerships, revenue, and learner engagement in one control tower.",
    kpis: [
      { label: "Total Students", value: "12,480", trend: "+3.2% MoM" },
      { label: "Active Batches", value: "86", trend: "+5 running today" },
      { label: "Conversion Rate", value: "21.4%", trend: "+2.1% vs last week" },
      { label: "Revenue (MTD)", value: "₹3.4 Cr", trend: "MTD", tone: "positive" },
    ],
    sections: [
      {
        title: "Sales Funnel Overview",
        items: [
          "Monitor conversions across Lead → Counselling → Demo → Assessment → Final → Converted stages with drop-off analytics.",
          "Inline actions: assign counsellor, schedule demo, trigger reminders, move candidate to next stage.",
          "Quick filters by source, counselor, time range, or program vertical.",
        ],
      },
      {
        title: "Live Classes Today",
        items: [
          "Real-time list of classes with cohort, tutor, active student count, and class health indicator.",
          "Join as an invisible observer with a single click; view live attendance heatmap & chat status.",
          "Auto alerts for missing tutors or low join rate (under 70%).",
        ],
      },
      {
        title: "Student Alerts",
        items: [
          "Unified risk center for low attendance, streak drops, missing assignments, and escalation flags.",
          "Bulk assign action owners (mentor, LSP, program manager) and add resolution notes.",
          "Heatmap view by cohort to detect systemic issues quickly.",
        ],
      },
      {
        title: "Partner & Revenue Snapshot",
        items: [
          "Finance card stack with program-wise revenue, pending dues, and scholarship burn.",
          "HR & Partnerships dashboard surfaces new companies, open roles, shortlist activity, and upcoming HR calls.",
          "Practice & Mentor stats: problems solved, assignment submissions, 1:1 completions, flagged sessions.",
        ],
      },
    ],
  },
  "lms-programs": {
    title: "Programs Management",
    description: "Curate flagship programs end-to-end – content, delivery teams, pricing, and lifecycle.",
    sections: [
      {
        title: "Program Catalog",
        items: [
          "Create or clone programs (Full Stack, Java, AI/ML, Cybersecurity) with modular templates.",
          "Define prerequisites, outcomes, certifications, and attach marketing collateral.",
          "Assign pricing tiers, payment plans, and scholarship rules per program.",
        ],
      },
      {
        title: "Operations Toolkit",
        items: [
          "Assign lead tutor, mentors, LSPs, QAs; map escalation matrix per cohort.",
          "Set enrollment caps, campus modes, live session cadence, and auto-generate joining links.",
          "Centralized repository for recordings, slides, Git repos, and practice assets tagged to modules.",
        ],
      },
    ],
  },
  "lms-curriculum": {
    title: "Curriculum Builder",
    description: "Design week-wise curriculum blueprints with granular lesson mapping and outcome tracking.",
    sections: [
      {
        title: "Visual Roadmaps",
        items: [
          "Drag-and-drop planner: Weeks → Classes → Topics with estimated effort and assessments.",
          "Attach learning objectives, resources, practice links, and evaluation rubrics per topic.",
          "Version history to compare iterations and roll out updates to active batches.",
        ],
      },
      {
        title: "Collaboration",
        items: [
          "Tutor & PM review workflow with inline comments, approval logs, and change requests.",
          "Bulk update modules across multiple batches; auto-notify stakeholders of syllabus adjustments.",
          "Sync downstream to practice engine and assessment builder for cohesive learning journeys.",
        ],
      },
    ],
  },
  "lms-batches": {
    title: "Batch Management",
    description: "Spin up and orchestrate cohorts with rosters, timelines, staffing, and compliance controls.",
    sections: [
      {
        title: "Lifecycle Pipeline",
        items: [
          "Kanban view by stage – Prospecting, Confirmed, In Progress, Graduated, Archived.",
          "Assign tutors/mentors/LSPs, set seat limits, map time zones, and manage waitlists.",
          "Embed policies for attendance, rescheduling, escalation thresholds per batch.",
        ],
      },
      {
        title: "Roster & Health",
        items: [
          "Student roster with onboarding status, fee status, risk rating, and mentor assignment.",
          "Automated alerts for low attendance, pending fees, or content gaps.",
          "Batch timeline with milestones (orientation, capstone, placement readiness).",
        ],
      },
    ],
  },
  "lms-schedule": {
    title: "Schedule Planner",
    description: "Central calendar for classes, assessments, reviews, and tutor availability management.",
    sections: [
      {
        title: "Planning Views",
        items: [
          "Switch between calendar, list, and cohort filters for scheduling clarity.",
          "Auto-suggest slots based on tutor calendars, holidays, and room availability.",
          "Bulk reschedule flows with notification templates and impact checks.",
        ],
      },
      {
        title: "Automation",
        items: [
          "Trigger calendar invites, communication reminders, and LMS schedule sync.",
          "Integrate with Zoom/Teams for instant link provisioning and tracking attendance.",
          "Highlight conflicts, double bookings, or SLA breaches proactively.",
        ],
      },
    ],
  },
  "lms-live-monitor": {
    title: "Live Classes Monitor",
    description: "Real-time control room for ongoing sessions with observability and quick interventions.",
    sections: [
      {
        title: "Session Dashboard",
        items: [
          "Live list with tutor, cohort, start time, current attendance %, and QoS indicator.",
          "Join invisibly to monitor or support; trigger chat nudges to tutors and learners.",
          "Heatmap of engagement: polls answered, doubts raised, average watch time.",
        ],
      },
      {
        title: "Alerting & Recovery",
        items: [
          "Auto-detect no-show tutors or low attendance – escalate to PM & LSP instantly.",
          "Fallback stream links, recording triggers, and mentor substitution workflows.",
          "Post-class health score streaming into dashboard analytics.",
        ],
      },
    ],
  },
  "lms-tutors": {
    title: "Tutor Management",
    description: "Directory and performance controls for instructional staff and guest faculty.",
    sections: [
      {
        title: "Roster & Availability",
        items: [
          "Filter by specialization, rating, bandwidth, language, and timezone.",
          "Manage onboarding tasks, contracts, NDA compliance, and payroll mapping.",
          "Assign cohorts with workload balancing suggestions and conflicts check.",
        ],
      },
      {
        title: "Performance Intelligence",
        items: [
          "Tutor scorecards – attendance, student feedback, assignment turnaround, NPS trends.",
          "Flag classes needing QA audits; create improvement plans with reminders.",
          "Store feedback logs, certifications, and compliance documentation.",
        ],
      },
    ],
  },
  "lms-content-approvals": {
    title: "Content Approvals",
    description: "Moderate tutor-created assets – notes, quizzes, polls – before publishing to learners.",
    sections: [
      {
        title: "Workflow",
        items: [
          "Queue segmented by asset type with filters for program, tutor, urgency.",
          "Preview content inline, annotate, approve/reject with structured feedback.",
          "Batch actions for recurring templates; auto-expire stale submissions.",
        ],
      },
      {
        title: "Governance",
        items: [
          "Audit log of approvals, version history, publish targets.",
          "Quality checklists, plagiarism scans, and media compliance review.",
          "Notifications to tutors/program managers on decisions with next steps.",
        ],
      },
    ],
  },
  "lms-learning-paths": {
    title: "Learning Paths",
    description: "Compose adaptive paths mixing live sessions, practice, assessments, and mentorship touchpoints.",
    sections: [
      {
        title: "Path Builder",
        items: [
          "Visual flow editor with branching conditions (quiz score, attendance, mentor feedback).",
          "Pull modules from curriculum, practice engine, certification center seamlessly.",
          "Assign to cohorts or individual learners; schedule release and track completion.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Path completion heatmaps, learner drop-off insights, and recommended adjustments.",
          "Compare cohorts across paths to validate curriculum experiments.",
          "Export path definitions for partner co-branding deployments.",
        ],
      },
    ],
  },
  "lms-recordings": {
    title: "Recordings Library",
    description: "Manage the single source of truth for class recordings, snippets, and allied assets.",
    sections: [
      {
        title: "Catalog",
        items: [
          "Tag recordings by program, module, cohort, learning objectives, skill level.",
          "Attach transcripts, notes, quizzes; mark best-in-class sessions for highlights.",
          "Control access windows, download permissions, and DRM watermarks.",
        ],
      },
      {
        title: "Operations",
        items: [
          "Bulk upload/import from Zoom, Teams, or external drives with auto-tagging.",
          "Archive policies with storage metrics and auto-cleanup suggestions.",
          "Surface viewership analytics and re-engagement recommendations.",
        ],
      },
    ],
  },
  "pm-syllabus": {
    title: "Syllabus Planner",
    description: "Weekly academic orchestration managed by program managers.",
    sections: [
      {
        title: "Planning Canvas",
        items: [
          "Week cards with objectives, deliverables, and dependencies across cohorts.",
          "Sync updates to tutors, LSPs, and practise engine automatically.",
          "Template library for standard bootcamp formats to accelerate planning.",
        ],
      },
      {
        title: "Health Monitoring",
        items: [
          "Track completion rate per week, assignment status, and assessment readiness.",
          "Highlight misalignments between planned vs delivered curriculum.",
          "Embed escalation workflow when weekly KPIs slip below thresholds.",
        ],
      },
    ],
  },
  "pm-weekly-plans": {
    title: "Weekly Class Plans",
    description: "Manage upcoming sessions, resources, and trainer readiness on a week-by-week basis.",
    sections: [
      {
        title: "Class Playbook",
        items: [
          "For each class: objective, slides, live poll plan, assignments, evaluation criteria.",
          "Checklist: content uploaded, QA done, tutor briefed, practice tasks scheduled.",
          "Auto-notify mentors/LSPs about post-class follow-up expectations.",
        ],
      },
      {
        title: "Risk Controls",
        items: [
          "Identify blocked content, missing tutors, or low preparedness with status chips.",
          "Quick action buttons to reassign, request support, or escalate to academic head.",
          "Snapshot export for weekly academic reviews and stand-ups.",
        ],
      },
    ],
  },
  "pm-content-review": {
    title: "Tutor Content Review",
    description: "Quality assurance workflow ensuring tutor uploads meet Brintelli standards.",
    sections: [
      {
        title: "Review Center",
        items: [
          "Queue of slides, code demos, labs awaiting review; filter by urgency or program.",
          "Inline comments with anchor highlights, change requests, and approval states.",
          "Score each asset on clarity, structure, engagement; track trends per tutor.",
        ],
      },
      {
        title: "Performance Insights",
        items: [
          "Heatmaps showing rework frequency by module or tutor.",
          "Enable faster turnaround with templates, checklists, and reference best practices.",
          "Connect with mentorship for tutors requiring additional coaching.",
        ],
      },
    ],
  },
  "pm-assessment-builder": {
    title: "Assessment Builder",
    description: "Create and manage quizzes, assignments, and evaluations aligned with curriculum outcomes.",
    sections: [
      {
        title: "Authoring Studio",
        items: [
          "Build MCQs, coding challenges, subjective questions with tagging and difficulty levels.",
          "Support randomization, weighted scoring, and partial marking.",
          "Attach rubrics, sample answers, and automated feedback templates.",
        ],
      },
      {
        title: "Delivery & Analytics",
        items: [
          "Schedule assessments per cohort, control retakes, and integrate proctoring.",
          "Realtime performance dashboards, concept breakdown, and improvement recommendations.",
          "Export results to placements and mentor teams for targeted interventions.",
        ],
      },
    ],
  },
  "pm-lesson-quality": {
    title: "Lesson Quality Reports",
    description: "Data-backed reporting on class execution, learner feedback, and quality trends.",
    sections: [
      {
        title: "Quality KPIs",
        items: [
          "Metrics: attendance, average feedback, assignment submission rate, doubt resolution time.",
          "Drill-down by tutor, cohort, or module to spot anomalies.",
          "Aggregate improvements post feedback loops and publish monthly reports.",
        ],
      },
      {
        title: "Action Plans",
        items: [
          "Generate action items for tutors/LSPs with due dates and status tracking.",
          "Highlight sessions flagged for QA review or re-run recommendations.",
          "Export decks for leadership reviews or accreditation reports.",
        ],
      },
    ],
  },
  "sales-leads": {
    title: "Lead Manager",
    description: "Full CRM table with segmentation, assignments, and nurture workflows.",
    sections: [
      {
        title: "360° Lead Profiles",
        items: [
          "Timeline of touchpoints (calls, emails, demos) with counsellor notes and recordings.",
          "Tag leads by source, vertical, intent, and scoring models.",
          "Quick actions: assign counselor, add tasks, trigger automated nudges.",
        ],
      },
      {
        title: "Bulk Operations",
        items: [
          "Import/export lists, dedupe, merge duplicates with intelligent suggestions.",
          "Bulk stage updates, communications, and pipeline movement.",
          "Audit log for compliance and SLA tracking per counsellor.",
        ],
      },
    ],
  },
  "sales-counselling": {
    title: "Counselling Pipeline",
    description: "Track counselling sessions, outcomes, and readiness for demo or assessment stages.",
    sections: [
      {
        title: "Pipeline View",
        items: [
          "Kanban boards per counsellor with conversion velocity heatmaps.",
          "Schedule sessions, attach Zoom links, log outcomes, and recommend next action.",
          "Segment by intent, program interest, geography for workload balancing.",
        ],
      },
      {
        title: "Performance",
        items: [
          "Counsellor KPIs – conversion, follow-up lag, demo attendance, revenue impact.",
          "Automated reminders for pending follow-ups and expiring leads.",
          "Comparison charts vs targets to drive coaching conversations.",
        ],
      },
    ],
  },
  "sales-demo": {
    title: "Demo Scheduling",
    description: "Coordinate orientation and trial classes at scale.",
    sections: [
      {
        title: "Scheduler",
        items: [
          "Calendar grid with available slots, tutor availability, seat limits.",
          "Send invites, automated reminders, and post-demo surveys.",
          "Real-time attendance dashboard with conversion labeling.",
        ],
      },
      {
        title: "Optimisation",
        items: [
          "Heatmaps for slot popularity, drop-offs, and conversion efficacy.",
          "Auto re-route no-shows to alternate slots with counselor follow-up tasks.",
          "Integrate with marketing for targeted nurture flows post demo.",
        ],
      },
    ],
  },
  "sales-interview": {
    title: "Interview Pipeline",
    description: "Manage product fit interviews and high-intent conversations.",
    sections: [
      {
        title: "Coordination",
        items: [
          "Schedule interviewer availability, share prep kits with leads.",
          "Track outcomes (fit, hold, reject) with notes and recommended actions.",
          "Sync updates to CRM timeline and inform next pipeline stage automatically.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Conversion heatmap by interviewer, program, or lead persona.",
          "Identify bottlenecks (slow scheduling, low interviewer supply).",
          "Export reports for leadership and product teams.",
        ],
      },
    ],
  },
  "sales-assessment": {
    title: "Assessment Pipeline",
    description: "Coordinate aptitude/technical assessments pre-enrolment.",
    sections: [
      {
        title: "Orchestration",
        items: [
          "Assign tests, monitor completion, auto-score technical assessments.",
          "Flag high scorers for fast-track interviews; handle retake workflows.",
          "Integrate with practise engine for pick-up tasks pre enrolment.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Conversion correlation between assessment performance and enrolment.",
          "Track drop-offs to refine difficulty or communication.",
          "Send tailored remediation suggestions to counsellors.",
        ],
      },
    ],
  },
  "sales-final-round": {
    title: "Final Approval Round",
    description: "Govern the final fitment panel before offer letter issuance.",
    sections: [
      {
        title: "Panel Workflow",
        items: [
          "Manage panel availability, share candidate dossiers, log decisions.",
          "Capture feedback rubric (skills, commitment, financial readiness).",
          "Trigger conditional actions (scholarship review, batch allocation).",
        ],
      },
      {
        title: "Compliance",
        items: [
          "Ensure requisite documents uploaded before approval (ID, transcripts).",
          "Audit trail for regulatory and internal QA.",
          "Integrate with finance to initiate payment workflows post approval.",
        ],
      },
    ],
  },
  "sales-offer-letters": {
    title: "Offer Letters Generator",
    description: "Generate, customize, and issue offer letters with e-sign support.",
    sections: [
      {
        title: "Templates",
        items: [
          "Template library per program with dynamic fields (fees, scholarship, start date).",
          "Preview letters, apply branding, include attachments (T&C, policies).",
          "Bulk send offers with e-sign integration and status tracking.",
        ],
      },
      {
        title: "Automation",
        items: [
          "Auto-trigger payment links, onboarding checklists upon acceptance.",
          "Dashboards for accepted, pending, expiring offers.",
          "Audit logs for modifications and approvals.",
        ],
      },
    ],
  },
  "sales-dashboard": {
    title: "Sales Dashboard & KPIs",
    description: "Comprehensive view of revenue pipeline and counselor performance.",
    sections: [
      {
        title: "Performance Charts",
        items: [
          "Revenue trend (MTD, QTD), conversion funnel, source efficiency.",
          "Counsellor leaderboard with conversion, AHT, revenue generated.",
          "Forecast projections vs targets with AI-driven recommendations.",
        ],
      },
      {
        title: "Operational Alerts",
        items: [
          "Overdue follow-ups, stalled leads, pipeline leaks.",
          "Marketing spend ROI data for campaign optimization.",
          "Integration with finance for realized vs projected collections.",
        ],
      },
    ],
  },
  "mentor-directory": {
    title: "Mentor Directory",
    description: "Comprehensive mentor database with availability and specialization details.",
    sections: [
      {
        title: "Directory",
        items: [
          "Search by tech stack, industry experience, languages, NPS score.",
          "Track onboarding status, certifications, background checks.",
          "Assign mentors to cohorts or individuals with conflict checks.",
        ],
      },
      {
        title: "Engagement",
        items: [
          "Monitor workloads, maximum 1:1 capacity, upcoming commitments.",
          "Flag mentors needing feedback or re-training.",
          "Export profiles for partnership pitches or marketing updates.",
        ],
      },
    ],
  },
  "mentor-lsp-directory": {
    title: "LSP Manager Directory",
    description: "Manage Learning Support Partner pool similar to mentors but focused on operational follow-up.",
    sections: [
      {
        title: "Roster",
        items: [
          "Filter LSPs by region, shift, cohort load, specialization (soft skills, technical support).",
          "View compliance checks, contract status, feedback averages.",
          "Assign to cohorts with limits and substitution suggestions.",
        ],
      },
      {
        title: "Performance",
        items: [
          "Metrics: ticket resolution time, student satisfaction, follow-up SLA adherence.",
          "Flag non-compliance or high-performing LSPs, plan coaching.",
          "Integrate with escalation and engagement dashboards.",
        ],
      },
    ],
  },
  "mentor-session-logs": {
    title: "1:1 Session Logs",
    description: "Central log of all mentor/LSP 1:1s with transcripts, notes, and action plans.",
    sections: [
      {
        title: "Logbook",
        items: [
          "Session list with date, student, mentor, type, outcome.",
          "Record notes, attachments, follow-up tasks; sync to student profile.",
          "Tag sessions needing escalation or QA review.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Session frequency vs target, coverage per learner, pending follow-ups.",
          "Heatmap for topics discussed to spot systemic issues.",
          "Export data for performance reviews and mentor billing.",
        ],
      },
    ],
  },
  "mentor-escalations": {
    title: "Student Escalations",
    description: "Workflow for managing student issues raised through mentors or LSPs.",
    sections: [
      {
        title: "Escalation Board",
        items: [
          "Track escalations by severity, owner, SLA, and resolution status.",
          "Automated routing rules to program managers or support teams.",
          "Attach evidence, conversation logs, and resolution documents.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Analyze escalation origins (content, mentor, placements, finance).",
          "Surface chronic issues, trending cohorts, or tutor-related patterns.",
          "Close loop with notifications to students and mentors.",
        ],
      },
    ],
  },
  "mentor-engagement": {
    title: "Engagement Metrics",
    description: "Monitor mentor and LSP engagement effectiveness.",
    sections: [
      {
        title: "KPIs",
        items: [
          "Track average response time, sessions completed, follow-up completion.",
          "View student satisfaction, escalation rate, NPS by mentor.",
          "Identify top mentors, plan knowledge sharing, manage attrition risk.",
        ],
      },
      {
        title: "Actions",
        items: [
          "Set engagement targets, send reminders, escalate under-performing mentors.",
          "Generate weekly summary to leadership.",
          "Integrate with payroll/compensation adjustments.",
        ],
      },
    ],
  },
  "mentor-reports": {
    title: "Weekly/Monthly Reports",
    description: "Generate shareable reports summarizing mentorship and support health.",
    sections: [
      {
        title: "Templates",
        items: [
          "Pre-built report templates for weekly, monthly, quarterly reviews.",
          "Customize sections (sessions, escalations, satisfaction, flagged learners).",
          "Schedule auto emails to leadership, mentors, partner teams.",
        ],
      },
      {
        title: "Data Pipeline",
        items: [
          "Pull from session logs, engagement metrics, student feedback.",
          "Compare across cohorts and mentors to highlight outliers.",
          "Export PDF/Slides with branded visuals.",
        ],
      },
    ],
  },
  "mentor-performance": {
    title: "Mentor & LSP Performance",
    description: "Scorecards combining qualitative and quantitative metrics.",
    sections: [
      {
        title: "Performance Cards",
        items: [
          "KPIs: NPS, sessions completed, escalation resolution, overdue tasks.",
          "Set rating bands with compensation or upskilling actions.",
          "Comparison charts and improvement history.",
        ],
      },
      {
        title: "Development Plans",
        items: [
          "Assign training, share feedback resources, track completion.",
          "Integrate with HR for contract renewals or incentives.",
          "Log manager notes and coach interventions.",
        ],
      },
    ],
  },
  "placement-internship": {
    title: "Internship Pipeline",
    description: "Manage internship journey from application to joining.",
    sections: [
      {
        title: "Stage Management",
        items: [
          "Pipeline columns: Application, Screening, Assessment, Interview, Offer, Joining.",
          "Candidate cards with readiness scores, resume, mentor feedback.",
          "Bulk actions for communication, interview scheduling, offer release.",
        ],
      },
      {
        title: "Company Collaboration",
        items: [
          "Track requisition vs filled positions, HR feedback, stipends.",
          "Auto-share candidate updates with mentors and PMs.",
          "Export pipeline stats to HR partners.",
        ],
      },
    ],
  },
  "placement-job": {
    title: "Job Pipeline",
    description: "Parallel pipeline for full-time roles with deeper evaluation tracking.",
    sections: [
      {
        title: "Candidate Journey",
        items: [
          "Stages: Application, Screening, Tech Assessment, HR Interview, Offer, Joining.",
          "Attach scorecards, coding test results, HR comments.",
          "Track candidate preferences, offer comparisons, negotiation status.",
        ],
      },
      {
        title: "Outcomes",
        items: [
          "Placement rate by cohort, role, company tier.",
          "Salary insights and benchmarking dashboards.",
          "Flag stalled candidates and assign placement counsellors.",
        ],
      },
    ],
  },
  "placement-assessments": {
    title: "Placement Assessments",
    description: "Central hub for coding, MCQ, and HR assessments within placement funnels.",
    sections: [
      {
        title: "Assessment Library",
        items: [
          "Upload/author assessments with categories (DSA, System Design, HR).",
          "Assign to candidates, configure proctoring, deadlines, retakes.",
          "Auto-grade coding tests, import recruiter results.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Compare candidate performance vs thresholds, highlight training needs.",
          "Send remediation plans to mentors or practise engine.",
          "Export reports to partner companies post shortlisting.",
        ],
      },
    ],
  },
  "placement-interviews": {
    title: "Interview Schedules",
    description: "Coordinate interviews across companies, ensure zero conflicts.",
    sections: [
      {
        title: "Scheduler",
        items: [
          "Calendar + timeline views with candidate/company/time zone filters.",
          "Auto reminders to candidates, mentors, HR.",
          "Manage reschedules, cancellations, and notes centrally.",
        ],
      },
      {
        title: "Logistics",
        items: [
          "Provide interviewer instructions, attach job descriptions, meeting links.",
          "Capture feedback forms post interview with scoring rubric.",
          "Track no-shows and escalate for reallocation.",
        ],
      },
    ],
  },
  "placement-candidate-status": {
    title: "Candidate Status",
    description: "Single view of every learner's placement readiness and pipeline status.",
    sections: [
      {
        title: "Profile Cards",
        items: [
          "Readiness metrics: resume score, mock interviews done, assessments passed.",
          "Placement preferences, targeted companies, mentor notes.",
          "Action buttons for mentor follow-up, additional training, resume review.",
        ],
      },
      {
        title: "Tracking",
        items: [
          "Flags for stuck candidates, opportunities matched, high-priority talent.",
          "Integration with CRM & finance to ensure fees compliance before lining up interviews.",
          "Export filtered lists for HR partner sharing.",
        ],
      },
    ],
  },
  "placement-offers": {
    title: "Offers Issued",
    description: "Manage offers across companies and statuses.",
    sections: [
      {
        title: "Offer Console",
        items: [
          "Record offer details: company, role, CTC, location, start date.",
          "Track status: accepted, pending, negotiating, declined.",
          "Trigger onboarding checklist for accepted offers.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Placement rate, CTC trends, company tier distribution.",
          "Scholarship clawback, revenue attribution, success stories.",
          "Export reports to leadership and marketing.",
        ],
      },
    ],
  },
  "placement-feedback": {
    title: "Company Feedback",
    description: "Capture recruiter feedback to enhance training outcomes.",
    sections: [
      {
        title: "Feedback Capture",
        items: [
          "Structured forms for HR to rate communication, technical depth, cultural fit.",
          "Log rejection reasons, improvement areas, standout candidates.",
          "Loop data back to mentors, LSPs, practise engine.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Trend charts to spot skill gaps, update curriculum priorities.",
          "Company satisfaction dashboard, partnership strength indicator.",
          "Export insights to leadership for strategic decisions.",
        ],
      },
    ],
  },
  "hr-partners": {
    title: "Partner Companies Directory",
    description: "Manage all hiring partners with detailed profiles and relationship CRM.",
    sections: [
      {
        title: "Company Profiles",
        items: [
          "Details: industry, headcount, roles offered, hiring history, partnership tier.",
          "Attach MoUs, agreements, NDAs with expiry reminders.",
          "Maintain notes on preferences, feedback, escalation contacts.",
        ],
      },
      {
        title: "Engagement",
        items: [
          "Track invites sent, shortlists, offers released, feedback loops.",
          "View active opportunities and upcoming drives.",
          "Assign relationship owner with tasks and reminders.",
        ],
      },
    ],
  },
  "hr-contacts": {
    title: "HR Contacts",
    description: "Directory of HR stakeholders with communication history.",
    sections: [
      {
        title: "Contact Cards",
        items: [
          "Store name, designation, phone, email, LinkedIn, timezone.",
          "Log last interaction, interest areas, support tickets.",
          "Segment by priority, responsiveness, company tier.",
        ],
      },
      {
        title: "Communication",
        items: [
          "Timeline of emails, calls, meetings with attachments.",
          "Set follow-up reminders, assign account managers.",
          "Integrate with email tools for one-click outreach.",
        ],
      },
    ],
  },
  "hr-internships": {
    title: "Internship Opportunities",
    description: "Catalogue internship roles coming from partners.",
    sections: [
      {
        title: "Opportunity Board",
        items: [
          "Add details: role, stipend, skills, vacancies, deadlines.",
          "Match recommended students via talent search engine.",
          "Track status from open to filled with HR feedback.",
        ],
      },
      {
        title: "Automation",
        items: [
          "Auto-notify eligible students, mentors, placement managers.",
          "Publish to LMS/practice dashboards for student self-application.",
          "Log conversion metrics for ROI analysis.",
        ],
      },
    ],
  },
  "hr-jobs": {
    title: "Job Opportunities",
    description: "Manage full-time role listings across partner network.",
    sections: [
      {
        title: "Role Management",
        items: [
          "Capture job specs, required skills, experience, CTC, location, mode.",
          "Link to active batches or proficiency tags for targeting.",
          "Track candidate progress and convert to placement pipeline.",
        ],
      },
      {
        title: "Reporting",
        items: [
          "Open vs filled positions, average time-to-fill, rejection ratios.",
          "Company-level dashboards for partnership reviews.",
          "Integrate with HR contact logs for context.",
        ],
      },
    ],
  },
  "hr-communications": {
    title: "HR Communication Logs",
    description: "Maintain institutional memory of all partner interactions.",
    sections: [
      {
        title: "Communication Feed",
        items: [
          "Log calls, emails, meetings with summaries, attachments, action items.",
          "Tag teammates, set follow-ups, track outcomes (positive, pending, escalation).",
          "Searchable by company, contact, topic.",
        ],
      },
      {
        title: "Monitoring",
        items: [
          "Discover dormant accounts needing outreach.",
          "Audit compliance for communication templates and tone.",
          "Export logs for quarterly partnership reviews.",
        ],
      },
    ],
  },
  "hr-shortlists": {
    title: "Candidate Shortlists",
    description: "Track HR-submitted shortlists and manage nomination workflow.",
    sections: [
      {
        title: "Shortlist Tracker",
        items: [
          "Upload or generate shortlists with candidate metadata.",
          "Manage acceptance, rejection, pending statuses with HR notes.",
          "Notify placement counsellors & mentors to prepare candidates.",
        ],
      },
      {
        title: "Metrics",
        items: [
          "Analyze shortlist-to-offer conversion, reasons for drop-off.",
          "Identify high-performing cohorts and training needs.",
          "Export data to HR for transparency.",
        ],
      },
    ],
  },
  "hr-mous": {
    title: "MoUs & Agreements",
    description: "Repository for all partnership agreements and legal docs.",
    sections: [
      {
        title: "Document Center",
        items: [
          "Upload PDFs, tag by company, type, renewal date.",
          "Set reminders for expiry/renewal, assign owners to follow up.",
          "Version history and comments for negotiation tracking.",
        ],
      },
      {
        title: "Compliance",
        items: [
          "Ensure NDA compliance before sharing data/placements.",
          "Link agreements to opportunities and pipelines for governance.",
          "Download bundles for audits.",
        ],
      },
    ],
  },
  "hr-analytics": {
    title: "Company Performance Analytics",
    description: "Assess partner engagement effectiveness.",
    sections: [
      {
        title: "Dashboards",
        items: [
          "Metrics: hires per company, offer acceptance, interview-to-offer ratio.",
          "Revenue from partnerships, satisfaction score, collaboration frequency.",
          "Compare by industry, company tier, geography.",
        ],
      },
      {
        title: "Actionable Insights",
        items: [
          "Identify high-value partners to double down on and low-engagement partners needing revival.",
          "Share reports with sales/placement leadership.",
          "Feed into strategy for new partnerships.",
        ],
      },
    ],
  },
  "practice-mandatory": {
    title: "Mandatory Assignments",
    description: "Control and track assignments all learners must complete.",
    sections: [
      {
        title: "Assignment Manager",
        items: [
          "Create assignments with deadlines, instructions, grading rubric.",
          "Assign to cohorts or paths, set reminders, enforce submission policies.",
          "Integrate with plagiarism & scoring modules.",
        ],
      },
      {
        title: "Tracking",
        items: [
          "Submission status dashboard, auto-scorer results, manual grading queue.",
          "Alerts for overdue submissions, escalate to mentors/LSPs.",
          "Export scores to analytics and placement readiness boards.",
        ],
      },
    ],
  },
  "practice-coding": {
    title: "Coding Challenges (DSA)",
    description: "Manage DSA challenge library and difficulty balancing.",
    sections: [
      {
        title: "Problem Bank",
        items: [
          "Categorize by topic, difficulty, tags; add editorial, solution hints.",
          "Import from question bank, integrate with test case builder.",
          "Set attempts allowed, scoring, leaderboard weighting.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Track solve rate, average time, hint usage.",
          "Identify weak areas to push targeted practise sets.",
          "Export data for mentor coaching sessions.",
        ],
      },
    ],
  },
  "practice-extra": {
    title: "Extra Practice Problems",
    description: "Offer extended practise beyond mandatory tasks.",
    sections: [
      {
        title: "Collections",
        items: [
          "Create playlists by theme, difficulty, company-specific practice.",
          "Attach recommended sequences, daily streak suggestions.",
          "Track opt-in usage and effectiveness.",
        ],
      },
      {
        title: "Engagement",
        items: [
          "Monitor practise streaks, reward badges, push notifications.",
          "Identify learners falling behind to prompt mentors.",
          "Export to marketing for success stories.",
        ],
      },
    ],
  },
  "practice-weekly": {
    title: "Weekly Practice Sheets",
    description: "Curated weekly assignments to reinforce learning.",
    sections: [
      {
        title: "Sheet Builder",
        items: [
          "Combine MCQs, coding problems, subjective questions with due dates.",
          "Reuse templates, auto-update based on curriculum changes.",
          "Preview student view and release schedule.",
        ],
      },
      {
        title: "Progress Tracking",
        items: [
          "Completion stats per cohort, grade distribution.",
          "Auto-suggest additional practise for low performers.",
          "Share summary with mentors for follow-up.",
        ],
      },
    ],
  },
  "practice-test-cases": {
    title: "Test Case Builder",
    description: "Create and manage test cases for coding problems and assignments.",
    sections: [
      {
        title: "Authoring",
        items: [
          "Add sample, hidden, stress test cases; set scoring weight.",
          "Upload input/output files, integrate with auto grader.",
          "Preview solution run, catch errors before publishing.",
        ],
      },
      {
        title: "Governance",
        items: [
          "Version control per problem, track changes and reviewers.",
          "Ensure fairness by balancing difficulties.",
          "Export cases for offline grade audits.",
        ],
      },
    ],
  },
  "practice-submissions": {
    title: "Student Submission Tracker",
    description: "Real-time tracking of practise submissions across engines.",
    sections: [
      {
        title: "Submission Feed",
        items: [
          "List of submissions with status, score, runtime, language, plagiarism flags.",
          "Filter by cohort, assignment, learner risk tier.",
          "Open detailed view with code diff, feedback, comments.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Identify learners falling behind, incomplete tasks, repeated failures.",
          "Trigger mentor nudges, recommend practise sheets.",
          "Export summary to placements for readiness tracking.",
        ],
      },
    ],
  },
  "practice-plagiarism": {
    title: "Plagiarism Checker",
    description: "Detect and manage copied solutions across assignments and challenges.",
    sections: [
      {
        title: "Detection",
        items: [
          "Automated similarity score across submissions, external sources.",
          "Highlight suspect blocks with side-by-side diff view.",
          "Integrate with AI detectors for narrative responses.",
        ],
      },
      {
        title: "Resolution",
        items: [
          "Assign investigations to mentors, log outcomes and penalties.",
          "Track repeat offenders, escalate to program management.",
          "Generate reports for academic integrity reviews.",
        ],
      },
    ],
  },
  "certification-exams": {
    title: "Certification Exams",
    description: "Manage official certification exams accredited to Brintelli.",
    sections: [
      {
        title: "Exam Management",
        items: [
          "Create exams with modules, weighting, pass criteria.",
          "Set eligibility rules, registration windows, seat limits.",
          "Enable proctoring, identity checks, and secure browser requirements.",
        ],
      },
      {
        title: "Operations",
        items: [
          "Generate admit cards, seat plans, invigilator rosters.",
          "Real-time exam monitoring, incident logging.",
          "Publish results to learners and placements automatically.",
        ],
      },
    ],
  },
  "certification-mocks": {
    title: "Mock Examinations",
    description: "Practice exams mirroring certification format for readiness.",
    sections: [
      {
        title: "Mock Library",
        items: [
          "Create mock tests with adaptive difficulty, time limits.",
          "Allow retakes, personalized feedback based on performance.",
          "Link recommended practise sets for weak areas.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Track readiness scores per learner and cohort.",
          "Suggest certification dates based on readiness.",
          "Export reports to mentors and placements.",
        ],
      },
    ],
  },
  "certification-scheduling": {
    title: "Exam Scheduling",
    description: "Schedule certification & mock exams, manage logistics.",
    sections: [
      {
        title: "Scheduling Board",
        items: [
          "Calendar with exam slots, capacity, invigilators.",
          "Automated conflict detection and student notifications.",
          "Integration with rooms/online proctoring setup.",
        ],
      },
      {
        title: "Administration",
        items: [
          "Generate candidate lists, attendance sheets, seating charts.",
          "Track status: scheduled, in-progress, completed, postponed.",
          "Trigger result processing pipeline once exam ends.",
        ],
      },
    ],
  },
  "certification-difficulty": {
    title: "Difficulty Levels",
    description: "Standardize difficulty levels across certification content.",
    sections: [
      {
        title: "Definition",
        items: [
          "Define difficulty categories with descriptors and benchmarks.",
          "Assign levels to questions and exams; enforce distribution rules.",
          "Review difficulty adjustments based on analytics.",
        ],
      },
      {
        title: "Governance",
        items: [
          "Audit logs of difficulty changes, reviewer approvals.",
          "Align difficulty with practise engine recommendations.",
          "Share guidelines with content authors for consistency.",
        ],
      },
    ],
  },
  "certification-auto-grading": {
    title: "Auto-Grading System",
    description: "Automated scoring engine for MCQ, coding, and structured responses.",
    sections: [
      {
        title: "Engine",
        items: [
          "Support for MCQ, coding (test cases), essay (keyword & AI scoring).",
          "Manual override workflow with audit trail.",
          "Integrate with practise engine to reuse logic.",
        ],
      },
      {
        title: "Quality Control",
        items: [
          "Review random samples for accuracy, calibrate scoring models.",
          "Handle re-evaluation requests and adjustments.",
          "Publish score breakdown to learners.",
        ],
      },
    ],
  },
  "certification-results": {
    title: "Results & Scorecards",
    description: "Manage result publishing, downloads, and compliance.",
    sections: [
      {
        title: "Result Center",
        items: [
          "View exam results, pass/fail, percentile, sectional scores.",
          "Apply moderation rules, grace policies, and release schedules.",
          "Notify learners, mentors, placements automatically.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Performance distribution, cohort comparisons, question-level stats.",
          "Flag anomalies requiring re-evaluation.",
          "Export scorecards to PDF / shareable links.",
        ],
      },
    ],
  },
  "certification-generator": {
    title: "Certificate Generator",
    description: "Issue branded certificates with verification flows.",
    sections: [
      {
        title: "Certificate Studio",
        items: [
          "Design templates, add dynamic fields, QR verification links.",
          "Batch generate certificates for cohorts, re-issue duplicates.",
          "Store versions for compliance and future audits.",
        ],
      },
      {
        title: "Verification",
        items: [
          "Public verification page, API access for employers.",
          "Track verification requests, suspicious activity alerts.",
          "Integrate with blockchain or ledger if needed.",
        ],
      },
    ],
  },
  "finance-payments": {
    title: "Payments & Transactions",
    description: "Finance cockpit for payment tracking and reconciliation.",
    sections: [
      {
        title: "Transaction Ledger",
        items: [
          "List payments with filters (method, status, gateway, program).",
          "Reconcile with gateway logs (Razorpay, Stripe).",
          "Flag discrepancies and trigger follow-up tasks.",
        ],
      },
      {
        title: "Automation",
        items: [
          "Auto-sync payment confirmations to CRM and LMS.",
          "Generate receipts, invoices, emails on payment success.",
          "Handle failed payments with retry workflows.",
        ],
      },
    ],
  },
  "finance-fee-receipts": {
    title: "Fee Receipts",
    description: "Manage receipt issuance and archival.",
    sections: [
      {
        title: "Receipt Management",
        items: [
          "Generate receipts with branding, legal text, invoice numbers.",
          "Send via email/SMS, download PDF, print-ready versions.",
          "Track acknowledgements and resend requests.",
        ],
      },
      {
        title: "Compliance",
        items: [
          "GST or taxation fields, audit logs, integration with accounting software.",
          "Handle corrections and credit notes.",
          "Group receipts by batch/program for audits.",
        ],
      },
    ],
  },
  "finance-dues": {
    title: "Outstanding Dues",
    description: "Monitor pending fees and plan recovery actions.",
    sections: [
      {
        title: "Dues Dashboard",
        items: [
          "List learners with outstanding amounts, due dates, last payment.",
          "Segment by severity, payment plan, counsellor.",
          "Trigger reminders, assign follow-ups, escalate to finance.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Track aging buckets, recovery rate, risk scoring.",
          "Tie dues data with CRM to hold back placement or certification access.",
          "Export to finance for provisioning.",
        ],
      },
    ],
  },
  "finance-course-revenue": {
    title: "Course Revenue Breakdown",
    description: "Understand revenue by program, cohort, SKU.",
    sections: [
      {
        title: "Revenue Insights",
        items: [
          "Charts comparing revenue by program, intake month, marketing cohort.",
          "Margin analysis after scholarships/discounts.",
          "Identify top-performing products, underperforming ones.",
        ],
      },
      {
        title: "Export",
        items: [
          "Export CSV/Slides for leadership, product teams.",
          "Integrate with BI for deeper forecasting.",
          "Link to CRM for conversion-to-revenue ratio.",
        ],
      },
    ],
  },
  "finance-batch-revenue": {
    title: "Batch Revenue",
    description: "Drill into revenue per batch/campus.",
    sections: [
      {
        title: "Batch Cards",
        items: [
          "Each batch: seats sold, fees collected, outstanding, scholarships applied.",
          "Track ROI per marketing channel for that batch.",
          "Plan mid-course interventions to recover revenue.",
        ],
      },
      {
        title: "Comparison",
        items: [
          "Compare similar batches to identify best practices.",
          "Highlight risk batches needing counsel follow-ups.",
          "Export to PM for operational adjustments.",
        ],
      },
    ],
  },
  "finance-scholarships": {
    title: "Scholarships & Discounts",
    description: "Manage scholarship policies and discount approvals.",
    sections: [
      {
        title: "Scholarship Manager",
        items: [
          "Track requests, approvals, documentation per learner.",
          "Set policies (need-based, merit), budgets, expiry.",
          "Auto-apply to invoices and update CRM notes.",
        ],
      },
      {
        title: "Discount Control",
        items: [
          "Configure counsellor-level discount limits.",
          "Approval workflow for exceptional waivers.",
          "Impact analytics on revenue and conversion.",
        ],
      },
    ],
  },
  "finance-refunds": {
    title: "Refund Requests",
    description: "Manage refund lifecycle with transparent communication.",
    sections: [
      {
        title: "Request Board",
        items: [
          "Track refund reason, amount, stage (requested → approved → processed).",
          "Attach documentation, escalation notes, approvals.",
          "Notify finance and student, record transaction IDs.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Monitor refund rates per program, reason analysis.",
          "Identify process improvements to reduce refunds.",
          "Link to CRM to adjust pipeline messaging.",
        ],
      },
    ],
  },
  "finance-emi": {
    title: "EMI Management",
    description: "Track installment schedules, payment statuses, and escalations.",
    sections: [
      {
        title: "EMI Dashboard",
        items: [
          "Schedule view per learner, due dates, amount, partner lender.",
          "Auto reminders before due date, escalation on missed installments.",
          "Mark settlements, restructure requests, close cases.",
        ],
      },
      {
        title: "Partner Sync",
        items: [
          "Import lender updates, reconcile data, flag mismatches.",
          "Generate reports for lending partners and finance.",
          "Integrate with CRM to manage risk communication.",
        ],
      },
    ],
  },
  "finance-analytics": {
    title: "Revenue Analytics",
    description: "Comprehensive revenue analytics across programs and timeframes.",
    sections: [
      {
        title: "Dashboards",
        items: [
          "MTD, QTD, YTD revenue charts; forecasts vs targets.",
          "Breakdown by program, cohort, geography, sales channel.",
          "Profitability after cost allocations.",
        ],
      },
      {
        title: "Insights",
        items: [
          "Alert on revenue dip, highlight growth opportunities.",
          "Export to finance & leadership for board reviews.",
          "Integrate with BI for advanced modeling.",
        ],
      },
    ],
  },
  "users-all": {
    title: "All Users",
    description: "Master directory across roles with status and access info.",
    sections: [
      {
        title: "Directory",
        items: [
          "Search by name, email, role, status, cohort.",
          "Quick actions: reset password, deactivate, impersonate read-only.",
          "View recent activity, login history, assigned resources.",
        ],
      },
      {
        title: "Imports & Sync",
        items: [
          "Bulk import via CSV/API, map fields, dedupe.",
          "Integrate with HRIS/CRM to keep data in sync.",
          "Audit log for compliance.",
        ],
      },
    ],
  },
  "users-roles": {
    title: "Role Management",
    description: "Define and manage roles across the platform.",
    sections: [
      {
        title: "Role Catalog",
        items: [
          "List roles (Admin, Program Manager, Tutor, Mentor, LSP, Sales, HR Partner, Placement Officer, Student).",
          "Edit descriptions, default permissions, onboarding checklists.",
          "Clone roles or create custom ones for partners.",
        ],
      },
      {
        title: "Governance",
        items: [
          "Assign approval workflows for role changes.",
          "Track role usage, inactive states, risk dashboards.",
          "Integrate with access controls for enforcement.",
        ],
      },
    ],
  },
  "users-access-controls": {
    title: "Access Controls (RBAC)",
    description: "Fine-grained permission management by role or user.",
    sections: [
      {
        title: "Permission Matrix",
        items: [
          "Feature grid to toggle read / write / admin access per role.",
          "Support conditional permissions (cohort-specific, data-level).",
          "Preview user experience before publishing changes.",
        ],
      },
      {
        title: "Monitoring",
        items: [
          "Detect privilege escalations, unauthorized attempts.",
          "Audit changes with time, requester, approvals.",
          "Export compliance reports for security reviews.",
        ],
      },
    ],
  },
  "users-activity": {
    title: "Activity Logs",
    description: "System-wide audit trail for security and compliance.",
    sections: [
      {
        title: "Log Explorer",
        items: [
          "Filter by user, module, action, severity.",
          "View old vs new values, IP, device, timestamp.",
          "Export for investigations, attach to support tickets.",
        ],
      },
      {
        title: "Alerting",
        items: [
          "Set alerts for suspicious patterns (bulk deletes, failed logins).",
          "Integrate with SIEM or Slack for real-time notifications.",
          "Archive logs for retention policy.",
        ],
      },
    ],
  },
  notifications: {
    title: "Notifications & Broadcasts",
    description: "Send announcements across cohorts, batches, or global user groups.",
    sections: [
      {
        title: "Composer",
        items: [
          "Craft notifications for email, SMS, push with templates.",
          "Segment audience by role, program, cohort, custom lists.",
          "Preview message, schedule send, attach media.",
        ],
      },
      {
        title: "History & Analytics",
        items: [
          "Track delivery, opens, clicks, bounces per channel.",
          "Manage drafts, recurring schedules, triggered flows.",
          "Archive communications for compliance.",
        ],
      },
    ],
  },
  analytics: {
    title: "System Analytics & Reports",
    description: "Central analytics hub spanning all functional areas.",
    sections: [
      {
        title: "Dashboards",
        items: [
          "Pre-built dashboards for LMS performance, batch analytics, sales funnel, placements, revenue, engagement.",
          "Switch contexts via tabs and saved views.",
          "Export visuals or schedule PDF delivery.",
        ],
      },
      {
        title: "Custom Reports",
        items: [
          "Drag-and-drop report builder with dimensions and measures.",
          "Apply filters, groupings, and share with stakeholders.",
          "Connect to data warehouse for advanced queries.",
        ],
      },
    ],
  },
  "it-management": {
    title: "IT Management",
    description: "Manage users, support tickets, and view audit logs for IT operations.",
    sections: [
      {
        title: "User Management",
        items: [
          "Create new user accounts for all roles including IT users.",
          "Update user details, reset passwords, and assign roles.",
          "Enable or disable user accounts with proper access controls.",
          "View all users with filtering and search capabilities.",
        ],
      },
      {
        title: "Support Ticket Management",
        items: [
          "View all support tickets across the system with status tracking.",
          "Assign tickets to IT support engineers for resolution.",
          "Update ticket status, add comments, and resolve issues.",
          "Track ticket categories, priorities, and SLA compliance.",
        ],
      },
      {
        title: "Audit Logs",
        items: [
          "View comprehensive audit logs for all system activities.",
          "Track user creation, role changes, and ticket operations.",
          "Monitor login attempts and security events.",
          "Filter logs by user, action, date range, and IP address.",
        ],
      },
    ],
  },
  settings: {
    title: "App Settings",
    description: "Configure system-wide preferences, branding, integrations, and security.",
    sections: [
      {
        title: "Branding & Communications",
        items: [
          "Upload logos, color palettes, email templates.",
          "Configure email/SMS gateways, sender domains, templates.",
          "Manage notification defaults and language packs.",
        ],
      },
      {
        title: "Integrations & Security",
        items: [
          "Payment gateway keys, CRM, HRIS, proctoring integrations.",
          "API keys with scopes, regenerate tokens, audit usage.",
          "Set up SSO, 2FA, password policies, session management.",
        ],
      },
    ],
  },
};
