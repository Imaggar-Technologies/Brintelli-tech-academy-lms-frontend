import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';

/**
 * Permission definitions (must match backend)
 */
export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Student management
  STUDENTS_CREATE: 'students:create',
  STUDENTS_READ: 'students:read',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  
  // Course management
  COURSES_CREATE: 'courses:create',
  COURSES_READ: 'courses:read',
  COURSES_UPDATE: 'courses:update',
  COURSES_DELETE: 'courses:delete',
  
  // Batch management
  BATCHES_CREATE: 'batches:create',
  BATCHES_READ: 'batches:read',
  BATCHES_UPDATE: 'batches:update',
  BATCHES_DELETE: 'batches:delete',
  
  // Finance
  FINANCE_READ: 'finance:read',
  FINANCE_UPDATE: 'finance:update',
  FINANCE_APPROVE: 'finance:approve',
  // Role-specific finance permissions
  FINANCE_AGENT_VIEW: 'finance:agent:view',
  FINANCE_LEAD_VIEW: 'finance:lead:view',
  FINANCE_HEAD_VIEW: 'finance:head:view',
  
  // Sales
  SALES_READ: 'sales:read',
  SALES_UPDATE: 'sales:update',
  SALES_CREATE: 'sales:create',
  SALES_DELETE: 'sales:delete',
  SALES_APPROVE: 'sales:approve',
  SALES_MANAGE_TEAM: 'sales:manage_team',
  SALES_VIEW_REPORTS: 'sales:view_reports',
  // Role-specific sales permissions
  SALES_AGENT_VIEW: 'sales:agent:view',
  SALES_LEAD_VIEW: 'sales:lead:view',
  SALES_HEAD_VIEW: 'sales:head:view',
  
  // Marketing
  MARKETING_READ: 'marketing:read',
  MARKETING_CREATE: 'marketing:create',
  MARKETING_UPDATE: 'marketing:update',
  // Role-specific marketing permissions
  MARKETING_AGENT_VIEW: 'marketing:agent:view',
  MARKETING_LEAD_VIEW: 'marketing:lead:view',
  MARKETING_HEAD_VIEW: 'marketing:head:view',
  
  // Placement
  PLACEMENT_READ: 'placement:read',
  PLACEMENT_UPDATE: 'placement:update',
  PLACEMENT_CREATE: 'placement:create',
  
  // HR
  HR_READ: 'hr:read',
  HR_UPDATE: 'hr:update',
  HR_CREATE: 'hr:create',
  // Role-specific HR permissions
  HR_AGENT_VIEW: 'hr:agent:view',
  HR_LEAD_VIEW: 'hr:lead:view',
  HR_HEAD_VIEW: 'hr:head:view',
  
  // Admin
  ADMIN_ALL: 'admin:all',
  ADMIN_SETTINGS: 'admin:settings',
  
  // LSM
  LSM_READ: 'lsm:read',
  LSM_UPDATE: 'lsm:update',
  LSM_CREATE: 'lsm:create',
  
  // Tutor
  TUTOR_READ: 'tutor:read',
  TUTOR_UPDATE: 'tutor:update',
  TUTOR_CREATE: 'tutor:create',
  
  // Mentor
  MENTOR_READ: 'mentor:read',
  MENTOR_UPDATE: 'mentor:update',
  MENTOR_CREATE: 'mentor:create',
  
  // Student (self)
  STUDENT_READ: 'student:read',
  STUDENT_UPDATE: 'student:update',
};

/**
 * Role-Permission mappings (must match backend)
 */
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.ADMIN_ALL,
    PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE, PERMISSIONS.USERS_DELETE,
    PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_UPDATE, PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.COURSES_CREATE, PERMISSIONS.COURSES_READ, PERMISSIONS.COURSES_UPDATE, PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.BATCHES_CREATE, PERMISSIONS.BATCHES_READ, PERMISSIONS.BATCHES_UPDATE, PERMISSIONS.BATCHES_DELETE,
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_UPDATE, PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_CREATE,
    PERMISSIONS.MARKETING_READ, PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.PLACEMENT_READ, PERMISSIONS.PLACEMENT_UPDATE, PERMISSIONS.PLACEMENT_CREATE,
    PERMISSIONS.HR_READ, PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_CREATE,
    PERMISSIONS.LSM_READ, PERMISSIONS.LSM_UPDATE, PERMISSIONS.LSM_CREATE,
    PERMISSIONS.TUTOR_READ, PERMISSIONS.TUTOR_UPDATE, PERMISSIONS.TUTOR_CREATE,
    PERMISSIONS.MENTOR_READ, PERMISSIONS.MENTOR_UPDATE, PERMISSIONS.MENTOR_CREATE,
  ],
  student: [
    PERMISSIONS.STUDENT_READ, PERMISSIONS.STUDENT_UPDATE,
    PERMISSIONS.COURSES_READ,
  ],
  tutor: [
    PERMISSIONS.TUTOR_READ, PERMISSIONS.TUTOR_UPDATE, PERMISSIONS.TUTOR_CREATE,
    PERMISSIONS.COURSES_READ, PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.STUDENTS_READ,
  ],
  lsm: [
    PERMISSIONS.LSM_READ, PERMISSIONS.LSM_UPDATE, PERMISSIONS.LSM_CREATE,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_UPDATE,
  ],
  mentor: [
    PERMISSIONS.MENTOR_READ, PERMISSIONS.MENTOR_UPDATE, PERMISSIONS.MENTOR_CREATE,
    PERMISSIONS.STUDENTS_READ,
  ],
  placement: [
    PERMISSIONS.PLACEMENT_READ, PERMISSIONS.PLACEMENT_UPDATE, PERMISSIONS.PLACEMENT_CREATE,
    PERMISSIONS.STUDENTS_READ,
  ],
  // Finance roles with hierarchy
  finance: [
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_UPDATE, PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.FINANCE_AGENT_VIEW, // Default finance role gets agent view
  ],
  finance_agent: [
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_UPDATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.FINANCE_AGENT_VIEW,
  ],
  finance_lead: [
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_UPDATE, PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.FINANCE_LEAD_VIEW,
  ],
  finance_head: [
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_UPDATE, PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.FINANCE_HEAD_VIEW,
  ],
  // Sales roles with hierarchy
  sales: [
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_CREATE,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.SALES_AGENT_VIEW, // Default sales role gets agent view
  ],
  sales_admin: [
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_DELETE, PERMISSIONS.SALES_APPROVE,
    PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_VIEW_REPORTS,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.USERS_READ, // Can view team members
    PERMISSIONS.SALES_HEAD_VIEW, // Sales admin = head level
  ],
  sales_lead: [
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_APPROVE, PERMISSIONS.SALES_VIEW_REPORTS, PERMISSIONS.SALES_MANAGE_TEAM,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.BATCHES_READ, // Can view batches for assignment
    PERMISSIONS.SALES_LEAD_VIEW,
  ],
  sales_agent: [
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.SALES_AGENT_VIEW,
  ],
  sales_head: [
    PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_DELETE, PERMISSIONS.SALES_APPROVE,
    PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_VIEW_REPORTS,
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.USERS_READ, // Can view team members
    PERMISSIONS.FINANCE_READ, // Can view financial data
    PERMISSIONS.BATCHES_READ, // Can view batches
    PERMISSIONS.SALES_HEAD_VIEW,
  ],
  // Marketing roles with hierarchy
  marketing: [
    PERMISSIONS.MARKETING_READ, PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.MARKETING_AGENT_VIEW, // Default marketing role gets agent view
  ],
  marketing_agent: [
    PERMISSIONS.MARKETING_READ, PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.MARKETING_AGENT_VIEW,
  ],
  marketing_lead: [
    PERMISSIONS.MARKETING_READ, PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.MARKETING_LEAD_VIEW,
  ],
  marketing_head: [
    PERMISSIONS.MARKETING_READ, PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.MARKETING_HEAD_VIEW,
  ],
  // HR roles with hierarchy
  hr: [
    PERMISSIONS.HR_READ, PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_CREATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.HR_AGENT_VIEW, // Default HR role gets agent view
  ],
  hr_agent: [
    PERMISSIONS.HR_READ, PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_CREATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.HR_AGENT_VIEW,
  ],
  hr_lead: [
    PERMISSIONS.HR_READ, PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_CREATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.HR_LEAD_VIEW,
  ],
  hr_head: [
    PERMISSIONS.HR_READ, PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_CREATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.HR_HEAD_VIEW,
  ],
  programManager: [
    PERMISSIONS.BATCHES_READ, PERMISSIONS.BATCHES_UPDATE, PERMISSIONS.BATCHES_CREATE,
    PERMISSIONS.COURSES_READ, PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.STUDENTS_READ,
  ],
  'program-manager': [
    PERMISSIONS.BATCHES_READ, PERMISSIONS.BATCHES_UPDATE, PERMISSIONS.BATCHES_CREATE,
    PERMISSIONS.COURSES_READ, PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.STUDENTS_READ,
  ],
};

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = (permission) => {
  const user = useSelector(selectCurrentUser);
  
  if (!user || !user.role) {
    return false;
  }

  const role = user.role;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];

  // Admin has all permissions
  if (role === 'admin' || rolePermissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return rolePermissions.includes(permission);
};

/**
 * Hook to check if user has any of the required permissions
 */
export const useAnyPermission = (permissions) => {
  const user = useSelector(selectCurrentUser);
  
  if (!user || !user.role) {
    return false;
  }

  const role = user.role;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];

  // Admin has all permissions
  if (role === 'admin' || rolePermissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return permissions.some(permission => rolePermissions.includes(permission));
};

/**
 * Hook to check if user has all required permissions
 */
export const useAllPermissions = (permissions) => {
  const user = useSelector(selectCurrentUser);
  
  if (!user || !user.role) {
    return false;
  }

  const role = user.role;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];

  // Admin has all permissions
  if (role === 'admin' || rolePermissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return permissions.every(permission => rolePermissions.includes(permission));
};

/**
 * Get all permissions for current user
 */
export const useUserPermissions = () => {
  const user = useSelector(selectCurrentUser);
  
  if (!user || !user.role) {
    return [];
  }

  const role = user.role;
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user has a specific role
 */
export const useRole = (allowedRoles) => {
  const user = useSelector(selectCurrentUser);
  
  if (!user || !user.role) {
    return false;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

