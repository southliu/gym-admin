# Task 7: Coach Frontend Page - Report

## Status: DONE

## Summary

Created the Coach management frontend page with full CRUD operations and a Schedule Drawer for managing coach schedule templates. The page follows the exact patterns established by existing gym pages (course, course-type, location).

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `src/pages/gym/coach/model.tsx` | Created | Search list, table columns, schedule columns, create/edit form, schedule template form |
| `src/pages/gym/coach/index.tsx` | Created | Full CRUD page with schedule Drawer (view/add/delete templates) |
| `src/locales/zh/gym.ts` | Modified | Added 17 coach-related Chinese locale keys |
| `src/locales/en/gym.ts` | Modified | Added 17 coach-related English locale keys |

## Page Features

### Standard CRUD List
- **Search**: Name (Input) + Status (Select)
- **Table**: ID, Name, Phone, Specialty, Status (tag), Created/Updated timestamps, Operations
- **Operations**: Edit, Delete, View Schedule (permission-gated)
- **Pagination**: Standard BasePagination with page size selector
- **Batch**: Row selection + batch delete placeholder
- **Create/Edit Modal**: Name (required), Phone (required), Specialty, Description, Status

### Schedule Drawer
- Opens when clicking "View Schedule" button (permission: `/gym/coach/schedule`)
- Shows schedule template table with: ID, Day of Week (enum labels), Start Time, End Time, Course Name, Delete operation
- Pagination support for schedule templates
- "Add Schedule Template" button in drawer header (permission-gated)
- Add template form: Day of Week (Select), Start Time (TimePicker), End Time (TimePicker), Course (ApiSelect)
- Delete template with confirmation via DeleteBtn

## Key Design Decisions

1. **model.tsx extension**: Uses `.tsx` (not `.ts`) because `scheduleColumns` and `tableColumns` contain JSX in their render functions
2. **ApiFn cast**: Uses `getCourseList as ApiFn` for the ApiSelect componentProps, matching the booking page pattern
3. **colors enum**: Uses `colors.green`/`colors.red` from `@/utils/constants` for status tags, not plain strings
4. **COACH_STATUS**: Custom status options using `public.open`/`public.close` labels (1=active, 0=inactive)
5. **DAY_OF_WEEK_OPTIONS**: Numeric values 1-7 for Monday-Sunday, rendered as enum labels in the table
6. **TimePicker formatting**: Type-asserts dayjs values to call `.format('HH:mm')` before sending to API
7. **Permission prefix**: `/gym/coach` with sub-permissions for create, update, delete, schedule

## TypeScript Verification

`npx tsc --noEmit` passes with zero errors.

## Commits

- `8d317ff` - `feat: add coach management page with schedule drawer` (4 files, 779 insertions)

## Self-Review Checklist

- [x] `src/pages/gym/coach/model.tsx` created with `.tsx` extension
- [x] `src/pages/gym/coach/index.tsx` created with full CRUD + schedule Drawer
- [x] Permission prefix set to `/gym/coach`
- [x] Uses `colors` enum from `@/utils/constants` for tag colors
- [x] Uses `as ApiFn` cast for API functions in ApiSelect componentProps
- [x] Auto-imports used for React/BaseComponent (no explicit imports for these)
- [x] Explicit antd imports where needed (Button, Drawer, Form, Table, message)
- [x] Locale keys added to both zh and en gym locale files
- [x] Follows existing gym page patterns (course, course-type, location)
- [x] TypeScript check passes with zero errors
- [x] Committed with conventional commit format
