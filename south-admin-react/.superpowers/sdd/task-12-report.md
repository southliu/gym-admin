# Task 12: Coach Module Menu & Permission Seed Data

## Status: DONE

## Summary

Added SQL seed data for the coach module to `init.sql` in `south-admin-nest`, following the exact same INSERT patterns as the existing gym module entries.

## Data Added

### Permissions (21 entries)

| Permission Name | Description |
|---|---|
| `/gym/coach` | Coach management module |
| `/gym/coach/view` | View coach |
| `/gym/coach/create` | Create coach |
| `/gym/coach/update` | Update coach |
| `/gym/coach/delete` | Delete coach |
| `/gym/coach/schedule` | View schedule |
| `/gym/coach-course` | Coach course module |
| `/gym/coach-course/view` | View coach course |
| `/gym/coach-course/create` | Create coach course |
| `/gym/coach-course/delete` | Delete coach course |
| `/gym/coach-schedule-template` | Schedule template module |
| `/gym/coach-schedule-template/view` | View schedule template |
| `/gym/coach-schedule-template/create` | Create schedule template |
| `/gym/coach-schedule-template/update` | Update schedule template |
| `/gym/coach-schedule-template/delete` | Delete schedule template |
| `/gym/coach-schedule-template/batchGenerate` | Batch generate schedule |
| `/gym/coach-schedule-override` | Schedule override module |
| `/gym/coach-schedule-override/view` | View schedule override |
| `/gym/coach-schedule-override/create` | Create schedule override |
| `/gym/coach-schedule-override/update` | Update schedule override |
| `/gym/coach-schedule-override/delete` | Delete schedule override |

### Page Menus (4 entries, type=2)

All added as children of the existing `/gym` directory menu (type=1), with orders 4-7:

| Label | Label_EN | Router | Order |
|---|---|---|---|
| Coach Management | Coach Management | /gym/coach | 4 |
| Coach Course | Coach Course | /gym/coach-course | 5 |
| Schedule Template | Schedule Template | /gym/coach-schedule-template | 6 |
| Schedule Override | Schedule Override | /gym/coach-schedule-override | 7 |

### Button Menus (17 entries, type=3)

Each button menu is linked to its parent page menu via `parent_id` and to its permission via `permission_id`.

- **Coach Management**: 5 buttons (View, Create, Update, Delete, View Schedule)
- **Coach Course**: 3 buttons (View, Create, Delete)
- **Coach Schedule Template**: 5 buttons (View, Create, Update, Delete, Batch Generate)
- **Coach Schedule Override**: 4 buttons (View, Create, Update, Delete)

### Role-Menu Associations (21 entries)

All 21 new menus (4 pages + 17 buttons) associated with the admin role.

## Permission-to-Code Mapping

Permissions are derived from the `permissionPrefix` constants in each frontend page:

| Page | Prefix | Operations |
|---|---|---|
| `src/pages/gym/coach/index.tsx` | `/gym/coach` | page, create, update, delete, viewSchedule (`/gym/coach/schedule`) |
| `src/pages/gym/coach-course/index.tsx` | `/gym/coach-course` | page, create, delete |
| `src/pages/gym/coach-schedule-template/index.tsx` | `/gym/coach-schedule-template` | page, create, update, delete, batchGenerate |
| `src/pages/gym/coach-schedule-override/index.tsx` | `/gym/coach-schedule-override` | page, create, update, delete |

## Notes

- The `/gym` directory menu already exists with type=1; new coach sub-menus use `router = '/gym' AND type = 1` in the parent_id subquery to avoid ambiguity with the `/gym/course` page menu (type=2).
- Section numbers renumbered: sections 21-25 are new coach data; original section 21 (user-role) became 27; original section 22 (role-menu) became 28; new section 29 adds coach role-menu associations.

## Commit

`122f562` feat: add coach module menu and permission seed data
