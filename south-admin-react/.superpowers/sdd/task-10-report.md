# Task 10 Report: Coach Course Assignment Frontend Page

## Status: DONE

## Summary

Created the coach-course assignment page at `src/pages/gym/coach-course/`. This is a simple create/delete-only page (no update) for managing coach-to-course assignments.

## Files Created/Modified

- `src/pages/gym/coach-course/model.tsx` -- Search, table columns, create form definitions
- `src/pages/gym/coach-course/index.tsx` -- Page component with CRUD (create + delete only)
- `src/locales/zh/gym.ts` -- Added 5 Chinese translation keys
- `src/locales/en/gym.ts` -- Added 5 English translation keys

## Implementation Details

- **Permission prefix**: `/gym/coach-course` with `page`, `create`, `delete` (no `update`)
- **Search**: Coach ApiSelect + Course ApiSelect using `getCoachList as ApiFn` and `getCourseList as ApiFn`
- **Table columns**: ID, coachName, courseName, createdAt (assignmentTime), operate (delete button)
- **Create modal**: Coach ApiSelect + Course ApiSelect with `params: { status: 1 }` to filter only open courses
- **API functions used**: `getCoachCoursePage`, `createCoachCourse`, `deleteCoachCourse` from `@/servers/gym/coach-course`
- Follows project conventions: auto-imports, `useCommonStore`, `useEffectOnActive`, `useSearchUrlParams`, `BaseSearch`/`BaseTable`/`BaseModal`/`BaseForm`/`BasePagination`

## Verification

- `npx tsc --noEmit` passes with zero errors

## Commits

- `45c32bd` feat: add coach course assignment page

## Report path

`D:/case/gym-admin/south-admin-react/.superpowers/sdd/task-10-report.md`
