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
    permissions: ["dashboard", "settings", "notifications", "analytics"],
    navSections: ["dashboard", "settings", "notifications", "analytics"]
  },
  programManager: {
    label: "Program Manager",
    permissions: combine(
      ["dashboard"],
      prefix("lms-"),
      prefix("pm-"),
      prefix("practice-"),
      prefix("mentor-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "lms", "program-manager", "mentor-lsp", "practice", "certifications", "notifications", "analytics"]
  },
  mentorOps: {
    label: "Mentor Operations",
    permissions: combine(
      ["dashboard"],
      prefix("mentor-"),
      prefix("pm-lesson-quality"),
      ["notifications"]
    ),
    navSections: ["dashboard", "mentor-lsp", "program-manager", "notifications"]
  },
  placementLead: {
    label: "Placement Lead",
    permissions: combine(
      ["dashboard"],
      prefix("placement-"),
      prefix("hr-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "placement", "hr", "sales", "notifications", "analytics"]
  },
  salesManager: {
    label: "Sales & CRM",
    permissions: combine(
      ["dashboard"],
      prefix("sales-"),
      ["finance-analytics", "notifications"]
    ),
    navSections: ["dashboard", "sales", "finance", "notifications"]
  },
  financeController: {
    label: "Finance Controller",
    permissions: combine(["dashboard"], prefix("finance-"), ["analytics"]),
    navSections: ["dashboard", "finance", "analytics"]
  },
  hrPartner: {
    label: "HR & Partnerships",
    permissions: combine(
      ["dashboard"],
      prefix("hr-"),
      prefix("placement-"),
      ["notifications", "analytics"]
    ),
    navSections: ["dashboard", "hr", "placement", "notifications", "analytics"]
  },
  practiceLead: {
    label: "Practice Lead",
    permissions: combine(["dashboard"], prefix("practice-"), ["analytics"]),
    navSections: ["dashboard", "practice", "analytics"]
  },
  certificationLead: {
    label: "Certification Lead",
    permissions: combine(["dashboard"], prefix("certification-"), ["analytics"]),
    navSections: ["dashboard", "certifications", "analytics"]
  },
  analyticsViewer: {
    label: "Analytics Viewer",
    permissions: ["dashboard", "analytics"],
    navSections: ["dashboard", "analytics"]
  },
  notificationManager: {
    label: "Communications",
    permissions: ["dashboard", "notifications"],
    navSections: ["dashboard", "notifications"]
  },
  settingsAdmin: {
    label: "Settings Admin",
    permissions: ["dashboard", "settings", "analytics"],
    navSections: ["dashboard", "settings", "analytics"]
  },
};

export const adminRoleOptions = Object.entries(adminRoles).map(([value, role]) => ({
  value,
  label: role.label,
}));
