import { adminModuleConfig } from "./adminNav";

const allPages = Object.keys(adminModuleConfig);

const prefix = (...prefixes) =>
  allPages.filter((pageId) => prefixes.some((p) => pageId.startsWith(p)));

const combine = (...lists) => Array.from(new Set(lists.flat()));

export const adminRoles = {
  admin: {
    label: "Platform Admin",
    permissions: ["*"],
    navSections: ["*"]
  },
  super_admin: {
    label: "Super Admin",
    permissions: ["*"],
    navSections: ["*"]
  },
  it_admin: {
    label: "IT Admin",
    permissions: ["*"],
    navSections: ["*"]
  },
  it_support: {
    label: "IT Support",
    permissions: combine(["dashboard", "settings", "notifications", "analytics", "website-cms"], prefix("website-cms-")),
    navSections: ["dashboard", "settings", "notifications", "analytics", "website-cms"]
  },
  programManager: {
    label: "Program Manager",
    permissions: combine(
      ["dashboard", "website-cms"],
      prefix("website-cms-"),
      prefix("lms-"),
      prefix("pm-"),
      prefix("practice-"),
      prefix("mentor-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "lms", "program-manager", "mentor-lsp", "practice", "certifications", "notifications", "analytics", "website-cms"]
  },
  mentorOps: {
    label: "Mentor Operations",
    permissions: combine(
      ["dashboard", "website-cms"],
      prefix("website-cms-"),
      prefix("mentor-"),
      prefix("pm-lesson-quality"),
      ["notifications"]
    ),
    navSections: ["dashboard", "mentor-lsp", "program-manager", "notifications", "website-cms"]
  },
  placementLead: {
    label: "Placement Lead",
    permissions: combine(
      ["dashboard", "website-cms"],
      prefix("website-cms-"),
      prefix("placement-"),
      prefix("hr-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "placement", "hr", "sales", "notifications", "analytics", "website-cms"]
  },
  salesManager: {
    label: "Sales & CRM",
    permissions: combine(
      ["dashboard", "website-cms"],
      prefix("website-cms-"),
      prefix("sales-"),
      ["finance-analytics", "notifications"]
    ),
    navSections: ["dashboard", "sales", "finance", "notifications", "website-cms"]
  },
  financeController: {
    label: "Finance Controller",
    permissions: combine(["dashboard", "website-cms"], prefix("website-cms-"), prefix("finance-"), ["analytics"]),
    navSections: ["dashboard", "finance", "analytics", "website-cms"]
  },
  hrPartner: {
    label: "HR & Partnerships",
    permissions: combine(
      ["dashboard", "website-cms"],
      prefix("website-cms-"),
      prefix("hr-"),
      prefix("placement-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "hr", "placement", "notifications", "analytics", "website-cms"]
  },
  practiceLead: {
    label: "Practice Lead",
    permissions: combine(["dashboard", "website-cms"], prefix("website-cms-"), prefix("practice-"), ["analytics"]),
    navSections: ["dashboard", "practice", "analytics", "website-cms"]
  },
  certificationLead: {
    label: "Certification Lead",
    permissions: combine(["dashboard", "website-cms"], prefix("website-cms-"), prefix("certification-"), ["analytics"]),
    navSections: ["dashboard", "certifications", "analytics", "website-cms"]
  },
  analyticsViewer: {
    label: "Analytics Viewer",
    permissions: combine(["dashboard", "analytics", "website-cms"], prefix("website-cms-")),
    navSections: ["dashboard", "analytics", "website-cms"]
  },
  notificationManager: {
    label: "Communications",
    permissions: combine(["dashboard", "notifications", "website-cms"], prefix("website-cms-")),
    navSections: ["dashboard", "notifications", "website-cms"]
  },
  settingsAdmin: {
    label: "Settings Admin",
    permissions: combine(["dashboard", "settings", "analytics", "website-cms"], prefix("website-cms-")),
    navSections: ["dashboard", "settings", "analytics", "website-cms"]
  },
  marketing: {
    label: "Marketing",
    permissions: combine(["dashboard"], prefix("marketing-")),
    navSections: ["dashboard", "marketing"]
  },
};

export const adminRoleOptions = Object.entries(adminRoles).map(([value, role]) => ({
  value,
  label: role.label,
}));
