# Navigation Debugging Guide

## Common Issues

### 1. Navigation Not Showing
**Symptoms:** Navigation menu is empty or showing wrong items

**Check:**
1. User role is correctly set in Redux: `user.role`
2. Permissions are correctly mapped in `ROLE_PERMISSIONS`
3. Navigation items have correct `permissions` array
4. Permission filter is working: Check browser console for errors

**Debug Steps:**
```javascript
// In browser console
const user = store.getState().auth.user;
console.log('User role:', user?.role);
console.log('User permissions:', user?.permissions);
console.log('Role permissions:', ROLE_PERMISSIONS[user?.role]);
```

### 2. Wrong Navigation Items Showing
**Symptoms:** User sees items they shouldn't have access to

**Check:**
1. Permission filter logic in `filters/permissionFilter.js`
2. Navigation items have correct `permissions` requirements
3. User has correct permissions in `ROLE_PERMISSIONS`

**Debug:**
- Check if item has `permissions: []` (empty = visible to all)
- Check if user has required permissions
- Check permission format: should be `"resource:action"` (e.g., `"sales:read"`)

### 3. Navigation Items Missing
**Symptoms:** User should see items but they're hidden

**Check:**
1. User has required permissions
2. Navigation item has correct `permissions` array
3. Permission filter is not too restrictive

**Debug:**
```javascript
// Check if permission is in user's permissions
const itemPermissions = ["sales:read", "sales:manage_team"];
const userPermissions = ROLE_PERMISSIONS["sales_lead"];
const hasPermission = itemPermissions.some(p => userPermissions.includes(p));
console.log('Has permission:', hasPermission);
```

## Testing Navigation

### Test Sales Agent Navigation
```javascript
// Should see:
// - Dashboard
// - My New Leads
// - My Active Leads
// - Meetings & Counselling
// - Assessments (read-only)
// - Tasks
// - Profile

// Should NOT see:
// - Executive Dashboard
// - Unassigned Leads
// - Team Management
// - Reports & Analytics
```

### Test Sales Lead Navigation
```javascript
// Should see:
// - Dashboard
// - Pipeline
// - Unassigned Leads
// - Team Active Leads
// - Batch-wise Leads
// - Batches & Courses
// - Meetings & Counselling
// - Assessments
// - Assign Leads to Agents
// - Tasks
// - Profile

// Should NOT see:
// - Executive Dashboard
// - Assign Leads to Sales Leads
// - Financial Processing
```

### Test Sales Head Navigation
```javascript
// Should see:
// - Executive Dashboard
// - Targets & Planning
// - Assign Leads to Sales Leads
// - Batches & Courses
// - Department Pipeline
// - Deals & Conversions
// - Financial Processing
// - Reports & Analytics
// - Profile

// Should NOT see:
// - My New Leads
// - My Active Leads
// - Assign Leads to Agents
```

## Permission Requirements

### Sales Agent
- `sales:read` - View sales data
- `sales:create` - Create leads
- `sales:update` - Update assigned leads

### Sales Lead
- `sales:read` - View sales data
- `sales:create` - Create leads
- `sales:update` - Update team leads
- `sales:approve` - Approve actions
- `sales:view_reports` - View reports
- `sales:manage_team` - Manage team (REQUIRED for team features)
- `batches:read` - View batches

### Sales Head / Admin
- `sales:read` - View all sales data
- `sales:create` - Create leads
- `sales:update` - Update any lead
- `sales:delete` - Delete leads
- `sales:approve` - Approve deals
- `sales:manage_team` - Manage all teams
- `sales:view_reports` - View all reports
- `finance:read` - View financial data
- `batches:read` - View batches

## Console Debugging

Add this to Navigation.jsx temporarily:

```javascript
const navConfig = useMemo(() => {
  const config = getRoleNavigation(role, user);
  console.log('Navigation Debug:', {
    role,
    userPermissions: user?.permissions || ROLE_PERMISSIONS[role],
    config,
    navigationItems: config?.navigation?.length,
  });
  return config || {
    title: "Brintelli LMS",
    subtitle: "Dashboard",
    pinned: [],
    navigation: [],
  };
}, [role, user]);
```

