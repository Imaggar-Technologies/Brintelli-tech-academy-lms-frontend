/**
 * Maps user roles to their default dashboard routes
 * Based on actual routes defined in AppRouter.jsx
 */
export const getRoleDashboard = (role) => {
  const roleMap = {
    // Main roles (matching database roles)
    admin: '/admin-portal/dashboard',
    super_admin: '/admin-portal/dashboard',
    it_admin: '/admin-portal/dashboard',
    it_support: '/admin-portal/dashboard',
    student: '/student/dashboard',
    tutor: '/tutor/dashboard',
    lsm: '/lsm/dashboard',
    placement: '/placement/dashboard',
    mentor: '/mentor/dashboard',
    programManager: '/program-manager/dashboard',
    finance: '/finance/dashboard',
    sales: '/sales/dashboard',
    sales_admin: '/sales/dashboard',
    sales_lead: '/sales/dashboard',
    sales_agent: '/sales/dashboard',
    marketing: '/marketing/dashboard',
    hr: '/external-hr/dashboard',
    // Alternative role names (from database or different formats)
    'program-manager': '/program-manager/dashboard',
    'hr-partner': '/external-hr/dashboard',
    'external-hr': '/external-hr/dashboard',
    'revenue': '/finance/dashboard', // Revenue maps to finance
  };

  // Normalize role (handle case variations)
  const normalizedRole = role?.toLowerCase() || role;
  
  return roleMap[normalizedRole] || roleMap[role] || '/student/dashboard'; // Default to student dashboard
};

/**
 * Gets the role label for display
 */
export const getRoleLabel = (role) => {
  const labelMap = {
    admin: 'Admin',
    super_admin: 'Super Admin',
    it_admin: 'IT Admin',
    it_support: 'IT Support',
    student: 'Student',
    tutor: 'Tutor',
    lsm: 'Learning Success Manager',
    placement: 'Placement Officer',
    mentor: 'Mentor',
    programManager: 'Program Manager',
    finance: 'Finance Manager',
    sales: 'Sales Team',
    sales_admin: 'Sales Admin',
    sales_lead: 'Sales Lead',
    sales_agent: 'Sales Agent',
    marketing: 'Marketing Team',
    hr: 'HR Partner',
    'program-manager': 'Program Manager',
    'hr-partner': 'HR Partner',
    'external-hr': 'HR Partner',
  };

  return labelMap[role] || role;
};

