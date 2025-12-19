# Role-Specific View Permissions System

## Overview

All hierarchical roles (Sales, Marketing, Finance, HR) now use role-specific view permissions for granular RBAC control.

## Permission Structure

### Format
`{domain}:{role}:view`

### Examples
- `sales:agent:view` - Sales Agent can view
- `sales:lead:view` - Sales Lead can view
- `sales:head:view` - Sales Head can view
- `marketing:agent:view` - Marketing Agent can view
- `finance:lead:view` - Finance Lead can view
- `hr:head:view` - HR Head can view

## Permissions Defined

### Sales Permissions
- `sales:agent:view` - Sales Agent view permission
- `sales:lead:view` - Sales Lead view permission
- `sales:head:view` - Sales Head view permission

### Marketing Permissions
- `marketing:agent:view` - Marketing Agent view permission
- `marketing:lead:view` - Marketing Lead view permission
- `marketing:head:view` - Marketing Head view permission

### Finance Permissions
- `finance:agent:view` - Finance Agent view permission
- `finance:lead:view` - Finance Lead view permission
- `finance:head:view` - Finance Head view permission

### HR Permissions
- `hr:agent:view` - HR Agent view permission
- `hr:lead:view` - HR Lead view permission
- `hr:head:view` - HR Head view permission

## Role-Permission Mappings

### Sales Roles
- **sales_agent**: Has `sales:agent:view` + basic sales permissions
- **sales_lead**: Has `sales:lead:view` + team management permissions
- **sales_head**: Has `sales:head:view` + department management permissions
- **sales_admin**: Has `sales:head:view` (treated as head level)

### Marketing Roles
- **marketing_agent**: Has `marketing:agent:view` + basic marketing permissions
- **marketing_lead**: Has `marketing:lead:view` + team management permissions
- **marketing_head**: Has `marketing:head:view` + department management permissions
- **marketing**: Default role gets `marketing:agent:view`

### Finance Roles
- **finance_agent**: Has `finance:agent:view` + basic finance permissions
- **finance_lead**: Has `finance:lead:view` + team management permissions
- **finance_head**: Has `finance:head:view` + department management permissions
- **finance**: Default role gets `finance:agent:view`

### HR Roles
- **hr_agent**: Has `hr:agent:view` + basic HR permissions
- **hr_lead**: Has `hr:lead:view` + team management permissions
- **hr_head**: Has `hr:head:view` + department management permissions
- **hr**: Default role gets `hr:agent:view`

## Navigation Filtering

Navigation items use role-specific permissions in their `permissions` array:

```javascript
{
  id: "dashboard",
  label: "Dashboard",
  permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
  // Visible to all sales roles
}

{
  id: "executive-dashboard",
  label: "Executive Dashboard",
  permissions: ["sales:head:view"],
  // Only visible to Sales Head
}

{
  id: "tasks",
  label: "Tasks",
  permissions: ["sales:agent:view"],
  // Only visible to Sales Agent
}
```

## Benefits

1. **Granular Control**: Each role has explicit view permissions
2. **Clear Hierarchy**: Easy to see which roles can access what
3. **Scalable**: Easy to add new roles or permissions
4. **Consistent**: Same pattern across all domains (Sales, Marketing, Finance, HR)

## Files Updated

1. `Frontend/src/utils/permissions.js` - Added role-specific permissions and updated ROLE_PERMISSIONS
2. `Frontend/src/config/navigation/base/sales.nav.js` - Uses role-specific permissions
3. `Frontend/src/config/navigation/base/marketing.nav.js` - Uses role-specific permissions
4. `Frontend/src/config/navigation/base/finance.nav.js` - Uses role-specific permissions
5. `Frontend/src/config/navigation/base/hr.nav.js` - Created with role-specific permissions
6. `Frontend/src/config/navigation/getNavigation.js` - Added HR domain mapping

