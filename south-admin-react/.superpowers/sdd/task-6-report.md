# Task 6: Coach Module API Files - Report

## Status: DONE

## Summary

Created 4 frontend API files for the coach scheduling module under `src/servers/gym/`. Each file follows the exact same pattern as the existing gym API files (course.ts, session.ts, booking.ts, etc.).

## Files Created

| File | API URL | Exported Functions |
|------|---------|-------------------|
| `src/servers/gym/coach.ts` | `/gym/coach` | `getCoachPage`, `getCoachList`, `getCoachById`, `createCoach`, `updateCoach`, `deleteCoach` |
| `src/servers/gym/coach-course.ts` | `/gym/coach-course` | `getCoachCoursePage`, `createCoachCourse`, `deleteCoachCourse` |
| `src/servers/gym/coach-schedule-template.ts` | `/gym/coach-schedule-template` | `getCoachScheduleTemplatePage`, `createCoachScheduleTemplate`, `updateCoachScheduleTemplate`, `deleteCoachScheduleTemplate`, `batchGenerateCoachSchedule` |
| `src/servers/gym/coach-schedule-override.ts` | `/gym/coach-schedule-override` | `getCoachScheduleOverridePage`, `createCoachScheduleOverride`, `updateCoachScheduleOverride`, `deleteCoachScheduleOverride` |

## Design Decisions

- All files import from `#/form` (`BaseFormData`), `#/public` (`PageServerResult`, `PaginationData`), and `@/utils/request` (`request`) - matching the project convention exactly.
- **coach.ts**: Full CRUD with `list` endpoint for dropdown usage, matching the backend controller which has `GET /list`.
- **coach-course.ts**: Only `page`, `create`, `delete` - matches the backend which only has these 3 endpoints. No update since coach-course is a simple association table.
- **coach-schedule-template.ts**: CRUD plus `batchGenerate` - the backend has a special `POST /batchGenerate` endpoint for batch schedule generation.
- **coach-schedule-override.ts**: CRUD without `list` endpoint - the backend doesn't expose a list endpoint for overrides.

## Self-Review

- [x] All 4 files created in `src/servers/gym/`
- [x] Each file follows the existing gym API file pattern exactly
- [x] Import types match project conventions (`#/form`, `#/public`, `@/utils/request`)
- [x] API URLs match the backend controller `@Controller()` paths exactly
- [x] Function signatures match the API design (correct HTTP methods and route patterns)
- [x] All backend endpoints are covered (no missing functions)
- [x] No existing files modified
- [x] Committed with conventional commit format

## Backend Endpoint Verification

| Backend Controller | Endpoints | Frontend Coverage |
|-|-|-|
| `CoachController` | GET /page, GET /list, GET /detail, POST /create, PUT /update/:id, DELETE /:id | 6/6 |
| `CoachCourseController` | GET /page, POST /create, DELETE /:id | 3/3 |
| `CoachScheduleTemplateController` | GET /page, POST /create, PUT /update/:id, DELETE /:id, POST /batchGenerate | 5/5 |
| `CoachScheduleOverrideController` | GET /page, POST /create, PUT /update/:id, DELETE /:id | 4/4 |

## Commits

- `bd92c1c` - `feat: add coach module API files` (4 files, 174 insertions)
