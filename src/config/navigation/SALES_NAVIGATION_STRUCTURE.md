# Sales Navigation Structure

## Overview

This document describes the navigation structure for Sales Lead and Sales Agent roles, as implemented in the RBAC/ABAC navigation system.

## Sales Lead Navigation

**Permissions Required:** `sales:read`, `sales:manage_team`, `batches:read`

### Menu Structure:
1. **Dashboard** - `/sales/dashboard`
2. **Leads** (Parent Menu)
   - **New Leads** - `/sales/new-leads` (requires `sales:manage_team`)
   - **Active Leads** - `/sales/active-leads`
   - **Unassigned Leads** - `/sales/unassigned-leads` (requires `sales:manage_team`)
3. **Batch Details** - `/sales/batch-details` (requires `sales:manage_team`, `batches:read`)
4. **Meetings & Counselling** - `/sales/meetings-counselling`
5. **Assessments** - `/sales/assessments`
6. **Deals & Conversions** (Parent Menu)
   - **Active Deals** - `/sales/deals`
   - **Negotiations** - `/sales/negotiations` (requires `sales:update`)
7. **Financial Processing** - `/sales/financial-processing`
8. **Tasks** - `/sales/tasks`
9. **Profile & Settings** - `/sales/profile`

## Sales Agent Navigation

**Permissions Required:** `sales:read` (but NOT `sales:manage_team`)

### Menu Structure:
1. **Dashboard** - `/sales/dashboard`
2. **Leads** (Parent Menu)
   - **New Assigned Leads** - `/sales/new-assigned-leads` (excludes `sales:manage_team`)
   - **Active Leads** - `/sales/active-leads`
3. **Screenings** - `/sales/screenings` (excludes `sales:manage_team`)
4. **Meetings & Counselling** - `/sales/meetings-counselling`
5. **Assessments** - `/sales/assessments`
6. **Deals & Conversions** (Parent Menu)
   - **Active Deals** - `/sales/deals`
   - **Negotiations** - `/sales/negotiations` (requires `sales:update`)
7. **Financial Processing** - `/sales/financial-processing`
8. **Tasks** - `/sales/tasks`
9. **Profile & Settings** - `/sales/profile`

## Key Differences

### Sales Lead vs Sales Agent:

| Feature | Sales Lead | Sales Agent |
|---------|-----------|-------------|
| **New Leads** | ✅ Shows "New Leads" | ❌ Hidden |
| **Unassigned Leads** | ✅ Shows | ❌ Hidden |
| **New Assigned Leads** | ❌ Hidden | ✅ Shows |
| **Batch Details** | ✅ Shows | ❌ Hidden |
| **Screenings** | ❌ Hidden | ✅ Shows |

### Shared Items:
- Dashboard
- Active Leads (different data via ABAC)
- Meetings & Counselling (different data via ABAC)
- Assessments (different data via ABAC)
- Deals & Conversions (different data via ABAC)
- Financial Processing (different data via ABAC)
- Tasks (different data via ABAC)
- Profile & Settings

## ABAC Data Filtering

### Sales Lead:
- **Active Leads**: Shows team's active leads (`teamId === user.teamId`)
- **New Leads**: Shows unassigned leads or leads assigned to team
- **Unassigned Leads**: Shows all unassigned leads (`assignedTo === null`)
- **Batch Details**: Shows batches they can assign leads to
- **Meetings**: Shows team's meetings
- **Assessments**: Shows team's assessments
- **Deals**: Shows team's deals
- **Financial Processing**: Shows team's financial data
- **Tasks**: Shows team's tasks

### Sales Agent:
- **New Assigned Leads**: Shows leads assigned to agent in `primary_screening` stage (`assignedTo === user.email AND pipelineStage === 'primary_screening'`)
- **Active Leads**: Shows leads assigned to agent beyond screening (`assignedTo === user.email AND pipelineStage !== 'primary_screening'`)
- **Screenings**: Shows screenings for leads assigned to agent
- **Meetings**: Shows meetings for their assigned leads
- **Assessments**: Shows assessments for their assigned leads (read-only)
- **Deals**: Shows their own deals
- **Financial Processing**: Shows financial data for their assigned leads
- **Tasks**: Shows their own tasks

## Implementation Details

### Permission-Based Visibility (RBAC):
- Uses `permissions` array to require specific permissions
- Uses `excludePermissions` array to hide items if user has those permissions
- Example: "New Assigned Leads" has `excludePermissions: ["sales:manage_team"]` to hide it from Sales Lead

### Data Filtering (ABAC):
- Implemented in page components, not navigation
- Filters data based on user attributes:
  - `assignedTo` (email)
  - `teamId`
  - `departmentId`
  - `pipelineStage`

## Files

- **Navigation Config**: `Frontend/src/config/navigation/base/sales.nav.js`
- **Permission Filter**: `Frontend/src/config/navigation/filters/permissionFilter.js`
- **Main Navigation Builder**: `Frontend/src/config/navigation/getNavigation.js`

