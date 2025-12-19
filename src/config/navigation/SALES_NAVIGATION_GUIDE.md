# Sales Operations Navigation Guide

## Overview

This document explains the Sales Operations navigation system, which uses **RBAC (Role-Based Access Control)** for menu visibility and **ABAC (Attribute-Based Access Control)** for data filtering.

## Key Concepts

### RBAC (Role-Based Access Control)
**Controls: Navigation Menu Visibility**

- Determines which menu items appear in the sidebar
- Based on user permissions (e.g., `sales:read`, `sales:manage_team`)
- If user lacks permission → menu item is hidden
- Implemented in: `filters/permissionFilter.js`

**Example:**
- Sales Agent has `sales:read` but NOT `sales:manage_team`
- Result: "Team Management" menu item is **hidden**

### ABAC (Attribute-Based Access Control)
**Controls: Data Visibility Within Pages**

- Determines which data records are shown on a page
- Based on user attributes (e.g., `ownerId`, `teamId`, `batchId`, `departmentId`)
- Implemented in: Page components (e.g., `Leads.jsx`, `ActiveLeads.jsx`)

**Example:**
- Sales Agent views "My Active Leads"
- Result: Only sees leads where `assignedTo === currentUser.email`
- Sales Lead views "Team Active Leads"
- Result: Only sees leads where `teamId === currentUser.teamId`

## Role Definitions

### Sales Agent
**Permissions:**
- `sales:read` - View sales data
- `sales:create` - Create new leads
- `sales:update` - Update assigned leads

**Attributes:**
- `assignedTo` - Email of the agent
- `teamId` - Team they belong to

**Navigation Items:**
1. Dashboard
2. My New Leads
3. My Active Leads
4. Meetings & Counselling
5. Assessments (read-only status)
6. Tasks
7. Profile

**Data Visibility (ABAC):**
- Only sees leads assigned to them (`assignedTo === user.email`)
- Only sees their own tasks
- Only sees meetings for their assigned leads

---

### Sales Lead
**Permissions:**
- `sales:read` - View sales data
- `sales:create` - Create new leads
- `sales:update` - Update team leads
- `sales:manage_team` - Manage team members and assignments
- `sales:view_reports` - View team reports

**Attributes:**
- `teamId` - Team they manage
- `managerId` - Their manager (Sales Head)
- `directReports` - Array of Sales Agents under them

**Navigation Items:**
1. Dashboard
2. Pipeline (Team + Batch)
3. Unassigned Leads
4. Team Active Leads
5. Batch-wise Leads
6. Batches & Courses (read-only)
7. Meetings & Counselling
8. Assessments
9. Assign Leads to Agents
10. Tasks
11. Profile

**Data Visibility (ABAC):**
- Sees all leads in their team (`teamId === user.teamId`)
- Sees unassigned leads (can assign to agents)
- Sees team members' tasks
- Can view batches they can assign leads to

---

### Sales Head / Sales Admin
**Permissions:**
- `sales:read` - View all sales data
- `sales:create` - Create new leads
- `sales:update` - Update any lead
- `sales:delete` - Delete leads
- `sales:approve` - Approve deals
- `sales:manage_team` - Manage all teams
- `sales:view_reports` - View all reports
- `finance:read` - View financial data

**Attributes:**
- `departmentId` - Department they manage
- `managerId` - Usually null (top level)
- `directReports` - Array of Sales Leads under them

**Navigation Items:**
1. Executive Dashboard
2. Targets & Planning
3. Assign Leads to Sales Leads
4. Batches & Courses (capacity view)
5. Department Pipeline
6. Deals & Conversions
7. Financial Processing (view-only)
8. Reports & Analytics
9. Profile

**Data Visibility (ABAC):**
- Sees all leads in department (`departmentId === user.departmentId`)
- Sees all teams and their performance
- Can view batch capacity and enrollment
- Full access to financial data (view-only)

---

## Workflow Integration

### 1. Program Manager Creates Batches
- PM creates batches in Program Manager module
- Batches are linked to courses
- Sales Head can view batch capacity

### 2. Sales Head Sets Targets
- Sales Head sets targets for Sales Leads via "Targets & Planning"
- Targets are stored with `teamId` and `batchId`

### 3. Sales Head Assigns Leads to Sales Leads
- Sales Head uses "Assign Leads to Sales Leads"
- Leads are assigned with `assignedTo` = Sales Lead email
- `teamId` is set to Sales Lead's team

### 4. Sales Lead Assigns Leads to Agents
- Sales Lead uses "Assign Leads to Agents"
- Leads are reassigned with `assignedTo` = Sales Agent email
- `teamId` remains the same

### 5. Sales Agent Works on Leads
- Agent sees leads in "My New Leads" (primary_screening stage)
- Agent completes pre-screening → moves to "My Active Leads" (meet_and_call stage)
- Agent adds call notes, books assessments
- Lead moves through pipeline stages

### 6. Automatic Data Reflection
- Meetings, assessments, interviews automatically appear in "My Active Leads"
- Data is filtered by `assignedTo` (ABAC)

### 7. Offer Release → Deal
- Once offer is released and accepted, lead becomes a Deal
- Deal is visible in "Deals & Conversions"
- Filtered by `ownerId`, `teamId`, `departmentId` (ABAC)

### 8. Financial Clearance → LSM Onboarding
- After financial clearance, student is onboarded to LSM dashboard
- Lead status changes to "onboarded_to_lsm"

---

## Pipeline Behavior by Role

### Sales Agent
- **View**: Kanban board with their assigned leads
- **Action**: Move single leads between stages
- **Filter**: Only leads where `assignedTo === user.email`

### Sales Lead
- **View**: Kanban board with team's leads
- **Action**: Move leads in batches (bulk operations)
- **Filter**: Leads where `teamId === user.teamId`

### Sales Head
- **View**: Analytics dashboard (no kanban)
- **Action**: View-only, no direct lead movement
- **Filter**: All leads in department (`departmentId === user.departmentId`)

---

## Page Responsibilities

### Pages to Create/Update

1. **`/sales/dashboard`** - Role-specific dashboard
   - Agent: Personal stats, assigned leads count
   - Lead: Team stats, batch performance
   - Head: Department-wide analytics

2. **`/sales/executive-dashboard`** - Sales Head only
   - Department KPIs, targets vs actuals
   - Team performance comparison

3. **`/sales/my-new-leads`** - Sales Agent only
   - Leads assigned to agent in `primary_screening` stage
   - ABAC: `assignedTo === user.email AND pipelineStage === 'primary_screening'`

4. **`/sales/my-active-leads`** - Sales Agent only
   - Leads assigned to agent beyond screening
   - Shows meetings, assessments, interviews automatically
   - ABAC: `assignedTo === user.email AND pipelineStage !== 'primary_screening'`

5. **`/sales/unassigned-leads`** - Sales Lead, Sales Head
   - All unassigned leads
   - ABAC: `assignedTo === null OR assignedTo === ''`

6. **`/sales/team-active-leads`** - Sales Lead only
   - All active leads in team
   - ABAC: `teamId === user.teamId`

7. **`/sales/batch-wise-leads`** - Sales Lead only
   - Leads grouped by batch
   - ABAC: Filtered by accessible batches

8. **`/sales/pipeline`** - All roles (different behavior)
   - Agent: Single lead movement
   - Lead: Batch movement
   - Head: Analytics view

9. **`/sales/department-pipeline`** - Sales Head only
   - Department-wide pipeline analytics

10. **`/sales/targets-planning`** - Sales Head only
    - Set targets for Sales Leads
    - View target vs actual performance

11. **`/sales/assign-leads`** - Sales Lead only
    - Assign unassigned leads to agents
    - Reassign existing leads

12. **`/sales/assign-leads-to-leads`** - Sales Head only
    - Assign leads to Sales Leads

13. **`/sales/batches-courses`** - Sales Lead (read-only), Sales Head (capacity view)
    - View batches and courses
    - Check capacity and enrollment

14. **`/sales/meetings-counselling`** - All roles
    - ABAC filtered by assignedTo, teamId, departmentId

15. **`/sales/assessments`** - All roles
    - Agent: Read-only status
    - Lead/Head: Can manage

16. **`/sales/deals`** - All roles
    - ABAC filtered by ownerId, teamId, departmentId

17. **`/sales/financial-processing`** - Sales Head only
    - View-only financial data

18. **`/sales/reports`** - Sales Lead, Sales Head
    - Team reports (Lead)
    - Department reports (Head)

19. **`/sales/tasks`** - All roles
    - ABAC filtered by assignedTo, teamId

20. **`/sales/profile`** - All roles
    - User profile and settings

---

## Implementation Notes

### Permission Format
All permissions use `resource:action` format:
- `sales:read`
- `sales:create`
- `sales:update`
- `sales:delete`
- `sales:manage_team`
- `sales:view_reports`
- `finance:read`
- `batches:read`

### Attribute Format
Attributes are stored in user object:
```javascript
{
  email: "agent@brintelli.com",
  role: "sales_agent",
  teamId: "team-123",
  managerId: "lead@brintelli.com",
  departmentId: "dept-456",
  assignedClasses: [], // For tutors (not sales)
  enrolledCourses: [], // For students (not sales)
}
```

### Data Filtering (ABAC) in Pages
Each page component should filter data based on user attributes:

```javascript
// Example: My Active Leads (Sales Agent)
const filteredLeads = leads.filter(lead => 
  lead.assignedTo === user.email && 
  lead.pipelineStage !== 'primary_screening'
);

// Example: Team Active Leads (Sales Lead)
const filteredLeads = leads.filter(lead => 
  lead.teamId === user.teamId
);

// Example: Department Pipeline (Sales Head)
const filteredLeads = leads.filter(lead => 
  lead.departmentId === user.departmentId
);
```

---

## Testing Checklist

- [ ] Sales Agent sees only "My New Leads" and "My Active Leads"
- [ ] Sales Agent cannot see "Team Management" or "Reports"
- [ ] Sales Lead sees "Unassigned Leads" and "Team Active Leads"
- [ ] Sales Lead can assign leads to agents
- [ ] Sales Head sees "Executive Dashboard" and "Targets & Planning"
- [ ] Sales Head can assign leads to Sales Leads
- [ ] Pipeline shows different behavior for each role
- [ ] Data is correctly filtered by ABAC attributes
- [ ] Meetings/assessments automatically appear in Active Leads

