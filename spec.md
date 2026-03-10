# AR Esports

## Current State
Admin panel uses frontend-only password (no backend login). Backend `approvePayment` and `rejectPayment` functions require `#admin` permission, but since admin panel user is anonymous (no Internet Identity login), these calls fail silently. History page shows generic "Pending/Approved/Rejected" labels.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend: Remove admin permission check from `approvePayment` and `rejectPayment` (consistent with public read queries, frontend password is the access control)
- History page: Change labels to "Registration in Progress" (pending) and "Registered" (approved)

### Remove
- Nothing

## Implementation Plan
1. Update `main.mo`: Remove admin permission check from `approvePayment` and `rejectPayment`
2. Update `HistoryPage.tsx`: Change PaymentBadge labels to "Registration in Progress" and "Registered"
