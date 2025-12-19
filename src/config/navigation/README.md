# Enterprise Navigation System

## Architecture

This navigation system uses **domain-based navigation** with **RBAC (Role-Based Access Control)** and **ABAC (Attribute-Based Access Control)** filtering.

## Directory Structure

```
navigation/
├── base/              # Domain-level navigation definitions
│   ├── sales.nav.js
│   ├── marketing.nav.js
│   ├── finance.nav.js
│   ├── academic.nav.js
│   ├── student.nav.js
│   └── system.nav.js
├── filters/           # Filtering logic
│   ├── permissionFilter.js   (RBAC)
│   └── attributeFilter.js    (ABAC)
└── getNavigation.js    # Main navigation builder
```

## How It Works

1. **Base Navigation**: Defines what COULD exist (domain level)
2. **RBAC Filter**: Filters by user permissions
3. **ABAC Filter**: Filters by user attributes (e.g., assignedClasses, enrolledCourses)
4. **Result**: Only shows navigation items the user can access

## Permission Format

Permissions use `resource:action` format:
- `sales:read`
- `sales:create`
- `sales:manage_team`
- `finance:read`
- etc.

## Attribute Format

Attributes are user-specific data:
- `assignedClasses: ["class-1", "class-2"]` (for tutors)
- `enrolledCourses: ["course-1"]` (for students)
- `assignedLeads: ["lead-1"]` (for sales agents)

## Usage

```javascript
import { getNavigation } from './getNavigation';

const nav = getNavigation({
  domain: 'sales',
  role: 'sales_agent',
  permissions: ['sales:read', 'sales:create'],
  attributes: { assignedLeads: ['lead-1'] }
});
```

## Benefits

✅ **Scalable**: Add new roles without creating new nav files
✅ **Secure**: No dead links - items hidden if user lacks permission
✅ **Flexible**: ABAC allows context-based filtering
✅ **Maintainable**: Single source of truth per domain
