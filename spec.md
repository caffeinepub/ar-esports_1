# AR Esports Tournament Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Multi-page Free Fire Max themed gaming website named "AR Esports"
- Google Sign-In (auth) required before tournament registration
- Tournament registration system for 2vs2 and 4vs4 matches
- Daily fixed schedule: 11am (2vs2), 1pm (4vs4), 4pm (2vs2), 8pm (4vs4)
- Registration form fields per tournament:
  - Team leader fills entire team form
  - Player fields per member: FF Max UID, Game Name, Phone Number, Email, Age
  - UPI ID (one per team, for prize payout)
  - Instagram ID (one per team, for prize/redeem code)
- Entry fees: Duo = Rs.30, Squad = Rs.40
- Win prizes: Duo = Rs.50, Squad = Rs.65
- Payment via QR code (uploaded: IMG-20260309-WA0008-1.jpg) and UPI ID: 8317701193@ybl, Payee: Purushottam Kumar
- Party popper / colorful confetti animation on successful registration
- Duplicate registration prevention (one registration per user per tournament)
- Tournament history per user (visible in profile/history section)
- 3-dot menu with History option
- Admin panel (password: adarshwebmaker)
  - View all signed-up users
  - View all tournament registrations
  - Approve/reject payment requests
  - When admin approves payment -> user sees "Payment Successful"
- Website branding: "AR Esports"
- Rights footer: "All rights reserved. Arpita, Adarsh and Rahul"
- Instagram contact: @a0arsh, @rahul373, @arpita_gaming27
- Credits at bottom: "Credit: Adarsh"
- Free Fire Max / gaming premium dark theme

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - User profile store (name, email, age, linked to Internet Identity / Google auth principal)
   - Tournament store: 4 daily tournaments with schedule
   - Registration store: team registrations per tournament per user
   - Duplicate check per user per tournament
   - Payment request store: pending/approved/rejected per registration
   - Admin functions: listUsers, listRegistrations, approvePayment, rejectPayment (password-gated)
   - History query per user

2. Frontend Pages:
   - Page 1 (Home): Hero with FF Max theme, daily tournament schedule cards, Sign In with Google CTA
   - Page 2 (Register): Tournament selection + team registration form with party popper confetti on success
   - Page 3 (Admin Panel): Password-protected dashboard showing users, registrations, payment approvals
   - 3-dot menu: links to History, Admin Panel
   - Payment section: QR image + UPI ID display
   - User history section embedded in profile/menu
