# Program, Module, and Session Creation Structure

## Overview
This document outlines the hierarchical structure for creating Programs, Modules, and Sessions in the Brintelli LMS system.

## Hierarchy
```
Program (Top Level)
  ├── Modules (Multiple modules per program)
  │     ├── Learning Objectives (Multiple objectives per module)
  │     ├── Resources (Ebooks, Demos, Lab Handouts)
  │     └── Sessions (Multiple sessions per module)
  │           ├── Batch Assignment
  │           ├── Tutor Assignment
  │           ├── Scheduled Date/Time
  │           └── Materials
```

## 1. Program Creation

### Structure
- **Multi-step wizard** (2 steps)
- **Step 1**: Program Details
- **Step 2**: Modules Management

### Program Fields
- `name` (required) - Program Name
- `code` (auto-generated) - Program Code
- `description` - Program Description
- `duration` - Duration in months
- `price` - Program Price
- `status` - DRAFT, ACTIVE, ARCHIVED

### Features
- Auto-save functionality (2 seconds after changes)
- Auto-generate code from program name
- Step-by-step navigation
- Module management in Step 2
- Validation before activation

### API Endpoints
- `POST /api/programs` - Create program
- `GET /api/programs/:programId` - Get program
- `PUT /api/programs/:programId` - Update program

## 2. Module Creation

### Structure
- **Standalone form** or **created within program**
- Links to a Program
- Contains Learning Objectives

### Module Fields
- `name` (required) - Module Name
- `description` - Module Description
- `order` - Display order in program
- `duration` - Duration in hours
- `status` - DRAFT, ACTIVE, COMPLETED
- `objectives` - Array of learning objectives
- `resources` - Array of resources (type, url, title)

### Features
- Auto-save functionality
- Learning objectives management
- Resources management (Ebooks, Demos, Lab Handouts)
- Order management
- Status tracking

### API Endpoints
- `POST /api/programs/:programId/modules` - Create module
- `GET /api/programs/:programId/modules` - Get modules
- `PUT /api/programs/modules/:moduleId` - Update module

## 3. Session Creation

### Structure
- **Modal form** or **standalone page**
- Links to Batch, Module, and Objective
- Assigned to a Tutor

### Session Fields
- `name` (required) - Session Name
- `description` - Session Description
- `batchId` (required) - Batch assignment
- `moduleId` (required) - Module assignment
- `objectiveId` (required) - Learning objective
- `tutorId` (required) - Tutor assignment
- `type` - LIVE, RECORDED, HYBRID
- `status` - SCHEDULED, ONGOING, COMPLETED, CANCELLED
- `scheduledDate` (required) - Date and time
- `duration` - Duration in minutes
- `meetingLink` - Meeting URL
- `recordingUrl` - Recording URL
- `materials` - Array of materials (type, url, title)

### Features
- Batch selection (loads available batches)
- Module selection (loads modules from selected batch's program)
- Objective selection (loads objectives from selected module)
- Tutor selection (loads available tutors)
- Date/time picker
- Materials management
- Meeting link management

### API Endpoints
- `POST /api/programs/modules/:moduleId/sessions` - Create session
- `GET /api/programs/modules/:moduleId/sessions` - Get sessions
- `PUT /api/programs/sessions/:sessionId` - Update session

## Component Files

### Programs
- `src/pages/program-manager/CreateProgram.jsx` - Main program creation wizard
- `src/pages/program-manager/Programs.jsx` - Programs listing with modals

### Modules
- `src/pages/program-manager/ModuleDetails.jsx` - Module creation/editing
- `src/pages/program-manager/Modules.jsx` - Modules listing

### Sessions
- `src/pages/program-manager/ObjectiveDetails.jsx` - Contains session modal
- `src/pages/lsm/BatchSessions.jsx` - Batch session management
- `src/pages/lsm/Sessions.jsx` - Session listing

## Data Flow

1. **Create Program** → Get programId
2. **Add Modules to Program** → Get moduleId
3. **Add Objectives to Module** → Get objectiveId
4. **Create Batch** → Get batchId
5. **Create Session** → Link batchId, moduleId, objectiveId, tutorId

## UI Patterns

### Program Creation
- Multi-step wizard with progress indicator
- Step 1: Form with validation
- Step 2: Module list with add/edit/delete
- Auto-save indicator
- Back/Next navigation

### Module Creation
- Single page form
- Auto-save functionality
- Learning objectives list (add/remove)
- Resources list (add/remove)
- Back to program navigation

### Session Creation
- Modal overlay
- Cascading dropdowns (Batch → Module → Objective)
- Date/time picker
- Tutor selection
- Materials management
- Form validation

## Status Workflow

### Program Status
- `DRAFT` → Initial state, can be edited
- `ACTIVE` → Program is live, modules required
- `ARCHIVED` → Program is archived

### Module Status
- `DRAFT` → Initial state
- `ACTIVE` → Module is active
- `COMPLETED` → Module is completed

### Session Status
- `SCHEDULED` → Session is scheduled
- `ONGOING` → Session is currently running
- `COMPLETED` → Session is completed
- `CANCELLED` → Session is cancelled

