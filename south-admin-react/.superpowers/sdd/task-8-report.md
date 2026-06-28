# Task 8: Coach Schedule Template Frontend Page

## Status: DONE

## Summary

Created the Coach Schedule Template management page with standard CRUD and batch generate functionality.

## Files Created/Modified

### New Files
- `src/pages/gym/coach-schedule-template/model.tsx` - Search list, table columns, create form, and batch generate form configuration
- `src/pages/gym/coach-schedule-template/index.tsx` - Full CRUD page with create/edit modal and batch generate modal

### Modified Files
- `src/servers/gym/coach-schedule-template.ts` - Added `getCoachScheduleTemplateById` API function for edit mode
- `src/locales/zh/gym.ts` - Added i18n keys: coachScheduleTemplateManage, coachName, batchGenerate, batchGenerateSchedule, dateRange
- `src/locales/en/gym.ts` - Added corresponding English translations

## Implementation Details

### model.tsx
- `searchList`: Coach Name (ApiSelect via `getCoachList as ApiFn`) and Day of Week (Select with DAY_OF_WEEK_OPTIONS)
- `tableColumns`: ID, Coach Name, Day of Week (enum tag), Start Time, End Time, Course Name, CreatedAt, UpdatedAt, Operate
- `createList`: Coach (ApiSelect, required), Day of Week (Select, required), Start Time (TimePicker HH:mm, required), End Time (TimePicker HH:mm, required), Course (ApiSelect, required)
- `batchGenerateList`: Coach (ApiSelect, required), Date Range (RangePicker, required)
- Uses `colors` enum pattern and `as ApiFn` casts as specified

### index.tsx
- Permission prefix: `/gym/coach-schedule-template`
- Permissions: page, create, update, delete, batchGenerate
- Full CRUD operations: create, read (by ID), update, delete
- Batch generate modal with coach and date range selection
- Search with URL params persistence via `useSearchUrlParams`
- Pagination with `INIT_PAGINATION` defaults
- Row selection for batch operations
- Two modals: create/edit modal and batch generate modal
- BaseForm handles dayjs-to-string conversion automatically for TimePicker and RangePicker

### API Integration
All API functions from `@/servers/gym/coach-schedule-template`:
- `getCoachScheduleTemplatePage` - Paginated list
- `getCoachScheduleTemplateById` - Single item for edit (newly added)
- `createCoachScheduleTemplate` - Create new
- `updateCoachScheduleTemplate` - Update existing
- `deleteCoachScheduleTemplate` - Delete single
- `batchGenerateCoachSchedule` - Batch generate schedules

## TypeScript Verification

`npx tsc --noEmit` passes with zero errors.

## Commit

```
feat: add coach schedule template page
```
