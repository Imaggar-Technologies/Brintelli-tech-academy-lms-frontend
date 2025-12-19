# Sales Navigation by Role - Complete Reference

This document shows exactly what navigation each sales role should see based on RBAC (Role-Based Access Control).

## How It Works

1. **Navigation Component** uses `user.role` from Redux (not URL path)
2. **getRoleNavigation** gets permissions from `ROLE_PERMISSIONS[role]`
3. **filterByPermissions** filters navigation items based on permissions
4. **ABAC** (Attribute-Based Access Control) filters data within pages

---

## Sales Agent Navigation

**Role**: `sales_agent`  
**Permissions**: `sales:read`, `sales:create`, `sales:update`, `students:read`, `students:create`

### Menu Items:
1. ✅ **Dashboard** (`/sales/dashboard`)
2. ✅ **Leads** (Parent Menu)
   - ❌ New Leads (requires `sales:manage_team`)
   - ✅ Active Leads
   - ✅ New Assigned Leads (excludes `sales:manage_team`)
3. ✅ **Meetings & Counselling** (`/sales/meetings-counselling`)
4. ✅ **Assessments** (`/sales/assessments`) - Read-only status view
5. ✅ **Deals & Conversions** (Parent Menu)
   - ✅ Active Deals
   - ✅ Negotiations (requires `sales:update`)
6. ❌ **Batch Details** (requires `sales:manage_team` AND `batches:read`)
7. ✅ **Screenings** (`/sales/screenings`) - Excludes `sales:manage_team`
8. ✅ **Financial Processing** (`/sales/financial-processing`)
9. ✅ **Tasks** (`/sales/tasks`)
10. ✅ **Profile & Settings** (`/sales/profile`)

**Total: 10 menu items**

---

## Sales Lead Navigation

**Role**: `sales_lead`  
**Permissions**: `sales:read`, `sales:update`, `sales:create`, `sales:approve`, `sales:view_reports`, `sales:manage_team`, `students:read`, `students:create`, `students:update`, `batches:read`

### Menu Items:
1. ✅ **Dashboard** (`/sales/dashboard`)
2. ✅ **Executive Dashboard** (`/sales/executive-dashboard`) - Requires `sales:view_reports` AND `sales:manage_team`
3. ✅ **Leads** (Parent Menu)
   - ✅ New Leads (requires `sales:manage_team`)
   - ✅ Active Leads
   - ❌ New Assigned Leads (excludes `sales:manage_team`)
4. ✅ **Meetings & Counselling** (`/sales/meetings-counselling`)
5. ✅ **Assessments** (`/sales/assessments`) - Can manage assessments
6. ✅ **Deals & Conversions** (Parent Menu)
   - ✅ Active Deals
   - ✅ Negotiations (requires `sales:update`)
7. ✅ **Batch Details** (`/sales/batch-details`) - Requires `sales:manage_team` AND `batches:read`
8. ❌ **Screenings** (excludes `sales:manage_team`)
9. ✅ **Financial Processing** (`/sales/financial-processing`)
10. ✅ **Tasks** (`/sales/tasks`)
11. ✅ **Profile & Settings** (`/sales/profile`)

**Total: 11 menu items**

---

## Sales Head Navigation

**Role**: `sales_head`  
**Permissions**: `sales:read`, `sales:update`, `sales:create`, `sales:delete`, `sales:approve`, `sales:manage_team`, `sales:view_reports`, `students:read`, `students:create`, `students:update`, `users:read`, `finance:read`, `batches:read`

### Menu Items:
1. ✅ **Dashboard** (`/sales/dashboard`)
2. ✅ **Executive Dashboard** (`/sales/executive-dashboard`) - Requires `sales:view_reports` AND `sales:manage_team`
3. ✅ **Leads** (Parent Menu)
   - ✅ New Leads (requires `sales:manage_team`)
   - ✅ Active Leads
   - ❌ New Assigned Leads (excludes `sales:manage_team`)
4. ✅ **Meetings & Counselling** (`/sales/meetings-counselling`)
5. ✅ **Assessments** (`/sales/assessments`) - Can manage assessments
6. ✅ **Deals & Conversions** (Parent Menu)
   - ✅ Active Deals
   - ✅ Negotiations (requires `sales:update`)
7. ✅ **Batch Details** (`/sales/batch-details`) - Requires `sales:manage_team` AND `batches:read`
8. ❌ **Screenings** (excludes `sales:manage_team`)
9. ✅ **Financial Processing** (`/sales/financial-processing`)
10. ✅ **Tasks** (`/sales/tasks`)
11. ✅ **Profile & Settings** (`/sales/profile`)

**Total: 11 menu items**

---

## Key Differences

| Feature | Sales Agent | Sales Lead | Sales Head |
|---------|------------|------------|------------|
| Executive Dashboard | ❌ | ✅ | ✅ |
| New Leads | ❌ | ✅ | ✅ |
| New Assigned Leads | ✅ | ❌ | ❌ |
| Batch Details | ❌ | ✅ | ✅ |
| Screenings | ✅ | ❌ | ❌ |
| Manage Assessments | ❌ (Read-only) | ✅ | ✅ |

---

## Testing

### Test Credentials

**Sales Agent:**
- Email: `sales_agent1@brintelli.com`
- Password: `SalesAgent@123`
- Should see: Dashboard, Leads (Active Leads, New Assigned Leads), Screenings

**Sales Lead:**
- Email: `sales_lead1@brintelli.com`
- Password: `SalesLead@123`
- Should see: Dashboard, Executive Dashboard, Leads (New Leads, Active Leads), Batch Details

**Sales Head:**
- Email: `sales_head@brintelli.com`
- Password: `SalesHead@123`
- Should see: Dashboard, Executive Dashboard, Leads (New Leads, Active Leads), Batch Details

---

## Debugging

If navigation is not working correctly, check the browser console for:
- `[Navigation] Role:` - Should show actual role (e.g., `sales_agent`, not `sales`)
- `[Navigation] Permissions:` - Should show array of permissions
- `[PermissionFilter]` - Shows which items are being hidden and why

---

## Files

- **Navigation Definition**: `Frontend/src/config/navigation/base/sales.nav.js`
- **Permission Filter**: `Frontend/src/config/navigation/filters/permissionFilter.js`
- **Role Permissions**: `Frontend/src/utils/permissions.js`
- **Navigation Builder**: `Frontend/src/config/navigation/getNavigation.js`
- **Navigation Component**: `Frontend/src/components/layout/Navigation.jsx`

