# Task 11: Booking Frontend Page

## Status: DONE

## Summary

Created the Booking management page with a CRUD list, cascading ApiSelect (Course -> Session -> User), cancel/delete actions, and status tags. The page supports creating new bookings via a modal with cascading selects and cancelling existing bookings via a confirm dialog.

## Files Created

1. **`src/pages/gym/booking/model.ts`** - Page model definitions:
   - `BOOKING_STATUS`: Color-coded status constants (green=confirmed=1, red=cancelled=2, blue=completed=3) with tag type rendering
   - `searchList`: User (ApiSelect via `getUserList`), Status (Select with BOOKING_STATUS)
   - `tableColumns`: 8 columns including ID, userName, courseName, sessionName, status (with enum tag rendering), createdAt, updatedAt, operate
   - `createList`: 3 form fields with cascading selects:
     - Course (ApiSelect, `getCourseList` with `params: { status: 1 }`, required)
     - Session (customize component with render function, dynamically fetches sessions based on selected courseId, required)
     - User (ApiSelect via `getUserList`, required)

2. **`src/pages/gym/booking/index.tsx`** - Full page component:
   - Permission prefix: `/gym/booking` with create and delete permissions
   - CRUD operations: getPage, onCreate, handleCreate, onDelete, onCancel
   - **No edit action** - bookings can only be created, cancelled, or deleted
   - Cancel action uses `DeleteBtn` with `customizeTitle="取消预约"` (Popconfirm with custom label)
   - Delete action uses standard `DeleteBtn`
   - `Form.useWatch('courseId')` + `formDataSet` ref to safely clear sessionId when course changes (avoids clearing during initial form data loading for edit)
   - Cascading session select uses `customize` component with `render` function that reads live `courseId` from form instance

## Server API Changes

Added list endpoints to support ApiSelect dropdowns:

- **`src/servers/gym/course.ts`**: Added `getCourseList(params?: BaseFormData)` - fetches course list for dropdown (filterable by status)
- **`src/servers/gym/session.ts`**: Added `getSessionList(params?: BaseFormData)` - fetches session list for dropdown (filterable by courseId)
- **`src/servers/system/user.ts`**: Added `getUserList()` - fetches user list for dropdown
- **`src/servers/gym/booking.ts`**: Added `getBookingById(id: string)` - fetches booking by ID (available for future edit functionality)

## Key Design Decisions

- **Cascading select pattern**: Used `customize` component with `render` function instead of static `componentProps` for the session field. This allows the render function to read the live `courseId` value from the form instance and create a dynamic ApiSelect with the correct API parameters.
- **Session field clearing**: Used `Form.useWatch('courseId')` in the parent component with a `formDataSet` ref guard. The ref prevents clearing sessionId during initial form data loading (when editing an existing booking with both courseId and sessionId already set).
- **Cancel button**: Used existing `DeleteBtn` component with `customizeTitle="取消预约"` prop to show a custom button label while retaining the Popconfirm confirmation pattern.
- **No edit action**: As specified in the task, bookings cannot be edited - only created, cancelled, or deleted.
- **Server list endpoints**: Added new `getCourseList`, `getSessionList`, and `getUserList` functions following the existing pattern from `getCourseTypeList` and `getLocationList`.

## Verification

- Both files follow existing patterns from course/index.tsx and location/index.tsx
- Auto-imports used correctly for React hooks, BaseContent, BaseCard, BaseSearch, BaseTable, BasePagination, BaseModal, BaseForm, DeleteBtn, useCommonStore, checkPermission, FORM_REQUIRED, INIT_PAGINATION, ADD_TITLE, ApiSelect
- Explicit imports for non-auto-imported items: Form, message from antd; useEffectOnActive from keepalive-for-react; API functions from servers; ApiFn type from types/form
- Custom render function in model uses `customize` component type with JSX (model file is `.ts` but the render function returns JSX - this works because the function is called at runtime, not at import time)
- Cascading select properly handles: new booking (course changes clear session), editing existing booking (formDataSet ref prevents clearing)

## Commit

`feat: add booking management page` (f88605a)
