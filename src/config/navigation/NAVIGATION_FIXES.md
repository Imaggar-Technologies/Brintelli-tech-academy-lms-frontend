# Navigation System Fixes

## Issues Fixed

### 1. Function Call Parameter Mismatch
**Problem:** `getNewRoleNavigation` was being called with an object `{ role, permissions, attributes }` but the function expects separate parameters `(role, userPermissions, userAttributes)`.

**Fix:** Updated `Frontend/src/config/navigation/index.js` line 248:
```javascript
// Before (WRONG):
const newConfig = getNewRoleNavigation({
  role,
  permissions: userPermissions,
  attributes: userAttributes,
});

// After (CORRECT):
const newConfig = getNewRoleNavigation(role, userPermissions, userAttributes);
```

### 2. Missing Permissions for Sales Lead
**Problem:** `sales_lead` role was missing `sales:manage_team` permission, which is required for team management features.

**Fix:** Added `PERMISSIONS.SALES_MANAGE_TEAM` and `PERMISSIONS.BATCHES_READ` to `sales_lead` in `Frontend/src/utils/permissions.js`.

### 3. Missing Sales Head Role
**Problem:** `sales_head` role was not defined in `ROLE_PERMISSIONS`.

**Fix:** Added `sales_head` role with all required permissions:
- `sales:read`, `sales:update`, `sales:create`, `sales:delete`, `sales:approve`
- `sales:manage_team`, `sales:view_reports`
- `finance:read` (for financial processing)
- `batches:read` (for batch management)
- `users:read` (for team management)

## How Navigation Works Now

### Flow:
1. **Navigation Component** calls `getRoleNavigation(role, user)`
2. **getRoleNavigation** (in `index.js`) tries new system first:
   - Gets user permissions from `user.permissions` or `ROLE_PERMISSIONS[role]`
   - Gets user attributes (assignedClasses, enrolledCourses, assignedLeads)
   - Calls `getNewRoleNavigation(role, userPermissions, userAttributes)`
3. **getNewRoleNavigation** (in `getNavigation.js`):
   - Determines domain from role (e.g., `sales_agent` → `sales` domain)
   - Gets base navigation from `domainNavMap[sales]` (which is `salesNav`)
   - Applies RBAC filter: `filterByPermissions(nav, permissions)`
   - Applies ABAC filter: `filterByAttributes(nav, attributes)`
   - Returns filtered navigation
4. **Navigation Component** displays filtered items

### RBAC (Role-Based Access Control)
- Controls **which menu items are visible**
- Based on user's permissions
- Implemented in `filters/permissionFilter.js`
- Example: If user doesn't have `sales:manage_team`, "Team Management" is hidden

### ABAC (Attribute-Based Access Control)
- Controls **which data is visible within pages**
- Based on user attributes (teamId, departmentId, assignedTo, etc.)
- Implemented in page components (e.g., `Leads.jsx`, `ActiveLeads.jsx`)
- Example: Sales Agent only sees leads where `assignedTo === user.email`

## Testing

### Test Sales Agent
1. Login as a `sales_agent` user
2. Should see:
   - Dashboard
   - My New Leads
   - My Active Leads
   - Meetings & Counselling
   - Assessments
   - Tasks
   - Profile
3. Should NOT see:
   - Executive Dashboard
   - Unassigned Leads
   - Team Management
   - Reports & Analytics
   - Financial Processing

### Test Sales Lead
1. Login as a `sales_lead` user
2. Should see:
   - Dashboard
   - Pipeline
   - Unassigned Leads
   - Team Active Leads
   - Batch-wise Leads
   - Batches & Courses
   - Meetings & Counselling
   - Assessments
   - Assign Leads to Agents
   - Tasks
   - Profile
3. Should NOT see:
   - Executive Dashboard
   - Assign Leads to Sales Leads
   - Financial Processing

### Test Sales Head
1. Login as a `sales_head` or `sales_admin` user
2. Should see:
   - Executive Dashboard
   - Targets & Planning
   - Assign Leads to Sales Leads
   - Batches & Courses
   - Department Pipeline
   - Deals & Conversions
   - Financial Processing
   - Reports & Analytics
   - Profile
3. Should NOT see:
   - My New Leads
   - My Active Leads
   - Assign Leads to Agents

## Debugging

If navigation is still not working:

1. **Check browser console** for errors
2. **Check user object** in Redux:
   ```javascript
   // In browser console
   const state = store.getState();
   console.log('User:', state.auth.user);
   console.log('Role:', state.auth.user?.role);
   ```
3. **Check permissions**:
   ```javascript
   import { ROLE_PERMISSIONS } from './utils/permissions';
   console.log('Sales Agent Permissions:', ROLE_PERMISSIONS.sales_agent);
   ```
4. **Check navigation config**:
   ```javascript
   import { getRoleNavigation } from './config/navigation';
   const config = getRoleNavigation('sales_agent', { role: 'sales_agent' });
   console.log('Navigation Config:', config);
   ```

## Files Modified

1. `Frontend/src/config/navigation/index.js` - Fixed function call
2. `Frontend/src/utils/permissions.js` - Added missing permissions for `sales_lead` and `sales_head`
3. `Frontend/src/config/navigation/base/sales.nav.js` - Updated with comprehensive navigation structure

