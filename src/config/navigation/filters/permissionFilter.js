/**
 * RBAC Filter - Permission-Based Navigation Filtering
 * Filters navigation items based on user permissions
 */

/**
 * Recursively filters navigation items by permissions
 * @param {Array} nav - Navigation items array
 * @param {Array} userPermissions - Array of user's permissions
 * @returns {Array} Filtered navigation items
 */
export function filterByPermissions(nav, userPermissions = []) {
  if (!nav || !Array.isArray(nav)) {
    return [];
  }

  return nav
    .map((item) => {
      // If item has children, recursively filter them
      if (item.children && Array.isArray(item.children)) {
        const filteredChildren = filterByPermissions(item.children, userPermissions);
        
        // If no children remain after filtering, remove the parent item
        if (filteredChildren.length === 0) {
          return null;
        }
        
        // Return item with filtered children
        return { ...item, children: filteredChildren };
      }

      // If item has no permissions requirement, show it
      if (!item.permissions || !Array.isArray(item.permissions) || item.permissions.length === 0) {
        return item;
      }

      // Check if item has exclusion permissions (should NOT show if user has these)
      if (item.excludePermissions && Array.isArray(item.excludePermissions)) {
        const hasExcludedPermission = item.excludePermissions.some((permission) =>
          userPermissions.includes(permission)
        );
        if (hasExcludedPermission) {
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log(`[PermissionFilter] Hiding "${item.label}" - user has excluded permission`);
          }
          return null; // Hide item if user has excluded permission
        }
      }

      // Check if user has ANY of the required permissions (OR logic)
      const hasPermission = item.permissions.some((permission) =>
        userPermissions.includes(permission)
      );

      // Admin has all permissions
      if (userPermissions.includes("admin:all")) {
        return item;
      }

      // Debug logging
      if (process.env.NODE_ENV === 'development' && !hasPermission) {
        console.log(`[PermissionFilter] Hiding "${item.label}" - missing permissions:`, item.permissions);
      }

      return hasPermission ? item : null;
    })
    .filter(Boolean); // Remove null items
}

