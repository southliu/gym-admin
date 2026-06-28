# Task 9: Coach Schedule Override Frontend Page

## Status: DONE

## Summary

Created the coach schedule override management page with full CRUD support. The page allows managing schedule overrides (leave, overtime, shift change) for coaches with search, table, and create/edit modal.

## Files Created

1. **`src/pages/gym/coach-schedule-override/model.tsx`** - Page model definitions:
   - `OVERRIDE_TYPE`: Leave (red), Overtime (blue), Shift Change (orange) - uses `colors` enum
   - `searchList`: Coach (ApiSelect with `getCoachList as ApiFn`), Override Type (Select)
   - `tableColumns`: ID, coachName, date, type (color tag), startTime, endTime, reason, createdAt, updatedAt, operate
   - `createList`: coachId (ApiSelect, required), date (DatePicker, required), type (Select, required), startTime (TimePicker, required), endTime (TimePicker, required), reason (TextArea)

2. **`src/pages/gym/coach-schedule-override/index.tsx`** - Full CRUD page component:
   - Permission prefix: `/gym/coach-schedule-override`
   - CRUD operations via `@/servers/gym/coach-schedule-override` API
   - Batch delete support (placeholder for backend)
   - Search with URL params
   - Pagination
   - Modal-based create/edit form
   - Row selection for batch operations

## Files Modified

3. **`src/servers/gym/coach-schedule-override.ts`** - Added `getCoachScheduleOverrideById` function (was missing, needed for edit flow)

4. **`src/locales/zh/gym.ts`** - Added translation keys: scheduleOverrideManage, overrideType, overrideLeave, overrideOvertime, overrideShiftChange, reason

5. **`src/locales/en/gym.ts`** - Added translation keys: scheduleOverrideManage, overrideType, overrideLeave, overrideOvertime, overrideShiftChange, reason

## Verification

- TypeScript: `npx tsc --noEmit` passes with zero errors

## Commit

`feat: add coach schedule override page`
