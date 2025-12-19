import { usePermission, useAnyPermission, useAllPermissions, useRole } from '../utils/permissions';

/**
 * Component to conditionally render children based on permission
 * 
 * @example
 * <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
 *   <Button>Create User</Button>
 * </PermissionGate>
 */
export const PermissionGate = ({ permission, children, fallback = null }) => {
  const hasPermission = usePermission(permission);
  return hasPermission ? children : fallback;
};

/**
 * Component to conditionally render children if user has ANY of the permissions
 * 
 * @example
 * <AnyPermissionGate permissions={[PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE]}>
 *   <Button>Edit User</Button>
 * </AnyPermissionGate>
 */
export const AnyPermissionGate = ({ permissions, children, fallback = null }) => {
  const hasPermission = useAnyPermission(permissions);
  return hasPermission ? children : fallback;
};

/**
 * Component to conditionally render children if user has ALL permissions
 * 
 * @example
 * <AllPermissionGate permissions={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE]}>
 *   <Button>Edit User</Button>
 * </AllPermissionGate>
 */
export const AllPermissionGate = ({ permissions, children, fallback = null }) => {
  const hasPermission = useAllPermissions(permissions);
  return hasPermission ? children : fallback;
};

/**
 * Component to conditionally render children based on role
 * 
 * @example
 * <RoleGate roles={['admin', 'tutor']}>
 *   <AdminPanel />
 * </RoleGate>
 */
export const RoleGate = ({ roles, children, fallback = null }) => {
  const hasRole = useRole(roles);
  return hasRole ? children : fallback;
};

export default PermissionGate;

