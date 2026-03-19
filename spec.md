# Team Daily Activity Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User login system for 5 team members: Rakesh, Nikil, Tony, Vivek, Ershad
- Pre-configured list of Activity Types: Monitoring Environment, Backup Activity, Restore Activity
- Pre-configured list of Environments: NYK, Seaspan, ONesea, and 12 more (total ~15)
- Daily Work Log entry: logged-in member selects an activity type, then selects one or more environments from the filtered list, and saves the entry with today's date
- View/pull data: filter work logs by date range, team member, and/or activity type
- Dashboard showing today's logs for the logged-in user
- Admin view: see all team members' logs

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: store activity types, environments, and daily work log entries (member, date, activity type, list of environments, notes)
2. Backend: CRUD for work log entries; query by date/member/activity
3. Backend: authorization to identify logged-in user
4. Frontend: login page
5. Frontend: log entry form -- select activity, pick environments, submit
6. Frontend: my logs view with date filter
7. Frontend: team logs view (all members) with filters
8. Frontend: simple data export (copy/download as CSV)
