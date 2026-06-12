# Swasthi Life Form Application

## Complete Planning Document Before Development

## 1. Project Goal

Create a simple digital form application for horoscope-related requests.

The application should support:

1. Registered users who submit forms through a mobile-friendly interface.
2. Admin users who view and manage submitted requests.
3. Guest users who submit forms through a public web page.
4. Sinhala and English languages.
5. Google Drive spreadsheet storage without a database for the first version.

---

# 2. Recommended Technology Structure

## Frontend

Use:

```text
React
Vite
TypeScript
React Router
react-i18next
```

The frontend should be responsive so it works properly on:

* Mobile phones
* Tablets
* Laptop screens
* Desktop screens

## Backend

Use:

```text
Python
FastAPI
Pydantic
Google Sheets API
JWT login tokens
Password hashing
```

## Storage

Use one Google Sheets workbook stored inside Google Drive.

The backend should read and update the sheet through the Google Sheets API.

Do not allow the React frontend to connect directly to Google Sheets.

---

# 3. High-Level System Structure

```text
React Frontend
    |
    | API Requests
    |
Python FastAPI Backend
    |
    | Read and Write
    |
Google Sheets Workbook
```

The frontend handles:

* Screen design
* Language switching
* Input fields
* Basic validation messages
* Mobile layout
* Navigation

The backend handles:

* Login
* Account activation
* Role checking
* Password checking
* Final form validation
* Request number generation
* Date and time generation
* Google Sheets updates
* Dashboard counts

---

# 4. User Roles

## ADMIN

Admins can:

* Log in
* View new requests
* View on-hold requests
* Mark requests as done
* Mark requests as on hold
* Cancel requests
* Search previous requests
* Filter requests
* View dashboard counts
* Create new user accounts
* View pending users
* View active users

## USER

Users can:

* Log in
* Create a password during the first login
* Fill the Hadahan form
* Fill the Porondam form
* Change the displayed language
* View app information
* Open settings
* Log out

## GUEST

Guests can:

* Open the public web page
* Select Sinhala or English
* Fill the Hadahan form
* Fill the Porondam form
* Submit the form without logging in
* Receive a request number after submission

---

# 5. User Account Statuses

Use only these account statuses:

| Internal Value | Meaning                                                            |
| -------------- | ------------------------------------------------------------------ |
| `PENDING`      | User account was created by an admin. Password is not created yet. |
| `ACTIVE`       | User created a password and can log in.                            |

---

# 6. Request Statuses

Use these request statuses:

| Internal Value | English Label | Sinhala Label       |
| -------------- | ------------- | ------------------- |
| `NEW`          | New           | අලුත්               |
| `ON_HOLD`      | On Hold       | තාවකාලිකව නතර කර ඇත |
| `DONE`         | Done          | අවසන් කර ඇත         |
| `CANCELLED`    | Cancelled     | අවලංගු කර ඇත        |

Save the internal values in English inside Google Sheets.

Translate only the displayed label in the frontend.

---

# 7. Language Support

The app should support:

```text
English
සිංහල
```

## Language Selection Behaviour

Show the language switch at the top-right corner of important screens.

Example:

```text
English | සිංහල
```

Remember the selected language in the browser using local storage.

The user should not need to select the language again every time.

## Translate These Items

Translate:

* Page titles
* Menu tiles
* Form labels
* Buttons
* Error messages
* Dashboard labels
* Request status labels
* Confirmation messages
* Settings labels
* Filter labels

## Do Not Automatically Translate User Input

Save names, addresses, places, and notes exactly as entered.

A person may enter:

```text
Balapitiya
```

or:

```text
බලපිටිය
```

Both values should be saved without changes.

---

# 8. Complete Screen List

Before coding, create a picture or wireframe for each screen below.

## Public and Shared Screens

| Number | Screen                             | Purpose                               |
| ------ | ---------------------------------- | ------------------------------------- |
| 1      | Language Selection                 | Select English or Sinhala             |
| 2      | Welcome Screen                     | Select login or guest form            |
| 3      | Login Screen                       | Enter username                        |
| 4      | Password Login Screen              | Enter password for an active account  |
| 5      | Password Creation Screen           | Create password for a pending account |
| 6      | Forgot Password Information Screen | Show a message to contact the admin   |
| 7      | Submission Success Screen          | Show request number                   |
| 8      | Logout Confirmation Popup          | Confirm logout                        |

## USER Screens

| Number | Screen                       | Purpose                                  |
| ------ | ---------------------------- | ---------------------------------------- |
| 9      | User Home Screen             | Show four square tiles                   |
| 10     | Hadahan Form Screen          | Fill one-person details                  |
| 11     | Hadahan Review Screen        | Review entered details before submitting |
| 12     | Porondam Contact Screen      | Enter shared contact information         |
| 13     | Porondam Girl Details Screen | Enter girl details                       |
| 14     | Porondam Boy Details Screen  | Enter boy details                        |
| 15     | Porondam Review Screen       | Review both people before submitting     |
| 16     | User Settings Screen         | Language, password, logout               |
| 17     | App Information Screen       | Show organisation details                |

## ADMIN Screens

| Number | Screen                 | Purpose                                       |
| ------ | ---------------------- | --------------------------------------------- |
| 18     | Active Requests Screen | Show new and on-hold requests                 |
| 19     | Request Details Screen | View the complete submitted form              |
| 20     | Update Status Popup    | Select done, on hold, or cancelled            |
| 21     | Admin Dashboard Screen | Show counts and recent activity               |
| 22     | Request History Screen | View previous requests                        |
| 23     | Filter Popup           | Filter by form type, status, date, and source |
| 24     | User Management Screen | View pending and active users                 |
| 25     | Create User Screen     | Create a user account                         |
| 26     | Admin Settings Screen  | Language and logout                           |

## GUEST Screens

| Number | Screen                | Purpose                       |
| ------ | --------------------- | ----------------------------- |
| 27     | Guest Form Selection  | Select Hadahan or Porondam    |
| 28     | Guest Contact Details | Enter name and contact number |
| 29     | Guest Hadahan Form    | Submit one-person details     |
| 30     | Guest Porondam Form   | Submit girl and boy details   |

A complete design pack should contain approximately 30 screen pictures. Some screens can reuse the same form components.

---

# 9. User Home Screen Design

Use four square tiles in a two-column layout.

```text
┌────────────────────────────┐
│ Welcome, Nimal             │
│                   සිංහල   │
│                            │
│ ┌──────────┐ ┌──────────┐ │
│ │ Hadahan  │ │ Porondam │ │
│ │   Form   │ │   Form   │ │
│ └──────────┘ └──────────┘ │
│                            │
│ ┌──────────┐ ┌──────────┐ │
│ │ Settings │ │ App Info │ │
│ └──────────┘ └──────────┘ │
│                            │
│              Log Out       │
└────────────────────────────┘
```

## Tile Labels

| English            | Sinhala                 |
| ------------------ | ----------------------- |
| Fill Hadahan Form  | හඳහන් පෝරමය පුරවන්න     |
| Fill Porondam Form | පොරොන්දම් පෝරමය පුරවන්න |
| Settings           | සැකසුම්                 |
| App Info           | යෙදුම පිළිබඳ විස්තර     |

---

# 10. Hadahan Form

The printed form contains details for one person.

## Fields Taken from the Printed Form

| English Label             | Sinhala Label    | Input Type      | Required |
| ------------------------- | ---------------- | --------------- | -------- |
| Full Name                 | සම්පූර්ණ නම      | Text            | Yes      |
| Address                   | ලිපිනය           | Multi-line text | Yes      |
| Contact Number            | දුරකථන අංකය      | Phone number    | Yes      |
| Additional Contact Number | අමතර දුරකථන අංකය | Phone number    | Optional |
| Date of Birth             | උපන් දිනය        | Date picker     | Yes      |
| Time of Birth             | උපන් වේලාව       | Time picker     | Yes      |
| Place of Birth            | උපන් ස්ථානය      | Text            | Yes      |
| Additional Notes          | අමතර සටහන්       | Multi-line text | Optional |

The printed form appears to allow more than one phone number. Use one required phone number and one optional additional phone number.

## Hadahan Form Layout

```text
┌────────────────────────────┐
│ Hadahan Form        සිංහල │
│                            │
│ Personal Details           │
│ Full Name                  │
│ [________________________] │
│                            │
│ Address                    │
│ [________________________] │
│ [________________________] │
│                            │
│ Contact Number             │
│ [________________________] │
│                            │
│ Additional Contact Number  │
│ [________________________] │
│                            │
│ Birth Details              │
│ Date of Birth  [ Select ]  │
│ Time of Birth  [ Select ]  │
│ Place of Birth             │
│ [________________________] │
│                            │
│ Notes                      │
│ [________________________] │
│                            │
│       [ Review Form ]      │
└────────────────────────────┘
```

---

# 11. Porondam Form

The Porondam form contains details for two people:

1. Girl
2. Boy

Use one shared contact section.

## Shared Contact Details

| English Label             | Sinhala Label                   | Required |
| ------------------------- | ------------------------------- | -------- |
| Contact Person Name       | සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම | Yes      |
| Address                   | ලිපිනය                          | Yes      |
| Contact Number            | දුරකථන අංකය                     | Yes      |
| Additional Contact Number | අමතර දුරකථන අංකය                | Optional |

## Girl Details

| English Label  | Sinhala Label             | Required |
| -------------- | ------------------------- | -------- |
| Girl Full Name | ගැහැණු ළමයාගේ සම්පූර්ණ නම | Yes      |
| Date of Birth  | උපන් දිනය                 | Yes      |
| Time of Birth  | උපන් වේලාව                | Yes      |
| Place of Birth | උපන් ස්ථානය               | Yes      |

## Boy Details

| English Label  | Sinhala Label             | Required |
| -------------- | ------------------------- | -------- |
| Boy Full Name  | පිරිමි ළමයාගේ සම්පූර්ණ නම | Yes      |
| Date of Birth  | උපන් දිනය                 | Yes      |
| Time of Birth  | උපන් වේලාව                | Yes      |
| Place of Birth | උපන් ස්ථානය               | Yes      |

## Porondam Flow

```text
Contact Details
      ↓
Girl Details
      ↓
Boy Details
      ↓
Review Form
      ↓
Submit
```

Use a progress indicator:

```text
1. Contact   2. Girl   3. Boy   4. Review
```

---

# 12. Admin Navigation

The admin interface should contain a bottom navigation bar.

```text
┌────────────────────────────┐
│ Active Requests            │
│                            │
│ Request Cards              │
│                            │
├────────────────────────────┤
│ Requests │ Dashboard       │
└────────────────────────────┘
```

Use two main tabs:

| Tab       | Purpose                                            |
| --------- | -------------------------------------------------- |
| Requests  | Show new and on-hold requests                      |
| Dashboard | Show counts, history, filters, and user management |

---

# 13. Active Request Card

Each admin request card should show:

```text
┌────────────────────────────┐
│ POR-2026-00015             │
│ Porondam Request           │
│ Submitted by: Guest        │
│ 08 Jun 2026, 10:35 AM      │
│ Status: NEW                │
│                 [ Open ]   │
└────────────────────────────┘
```

## Required Card Details

| Field             |
| ----------------- |
| Request Number    |
| Form Type         |
| Submitted By      |
| Submission Source |
| Submitted Date    |
| Submitted Time    |
| Current Status    |

---

# 14. Admin Request Details Screen

Show the complete submitted form.

At the bottom, show three buttons:

```text
[ DONE ]   [ ON HOLD ]   [ CANCEL ]
```

When an admin selects `ON_HOLD` or `CANCELLED`, show an optional note field.

```text
Admin Note
[________________________]
[________________________]

[ Confirm ]
```

---

# 15. Admin Dashboard

Show summary cards.

```text
┌────────────────────────────┐
│ Dashboard                  │
│                            │
│ ┌─────────┐ ┌─────────┐   │
│ │   14    │ │    6    │   │
│ │   New   │ │ On Hold │   │
│ └─────────┘ └─────────┘   │
│                            │
│ ┌─────────┐ ┌─────────┐   │
│ │   82    │ │    4    │   │
│ │  Done   │ │Cancelled│   │
│ └─────────┘ └─────────┘   │
│                            │
│ Recent Requests            │
│ User Management            │
│ Request History            │
└────────────────────────────┘
```

## Dashboard Counts

| Dashboard Item              |
| --------------------------- |
| Total Requests              |
| New Requests                |
| On-Hold Requests            |
| Completed Requests          |
| Cancelled Requests          |
| Hadahan Requests            |
| Porondam Requests           |
| Guest Submissions           |
| Registered User Submissions |

---

# 16. Google Sheets Workbook Structure

Create one workbook:

```text
Swasthi_Life_App_Data
```

Create these sheets:

```text
Users
Hadahan
Porondam
ActivityLog
Settings
```

## Sheet 1: Users

| Column         |
| -------------- |
| User ID        |
| Full Name      |
| Username       |
| Password Hash  |
| Role           |
| Account Status |
| Created At     |
| Last Login     |

Use these values:

```text
ADMIN
USER
PENDING
ACTIVE
```

## Sheet 2: Hadahan

| Column                    |
| ------------------------- |
| Internal ID               |
| Request Number            |
| Submitted Date            |
| Submitted Time            |
| Source                    |
| Submitted By              |
| Preferred Language        |
| Full Name                 |
| Address                   |
| Contact Number            |
| Additional Contact Number |
| Date of Birth             |
| Time of Birth             |
| Place of Birth            |
| Additional Notes          |
| Status                    |
| Admin Note                |
| Last Updated              |

## Sheet 3: Porondam

| Column                    |
| ------------------------- |
| Internal ID               |
| Request Number            |
| Submitted Date            |
| Submitted Time            |
| Source                    |
| Submitted By              |
| Preferred Language        |
| Contact Person Name       |
| Address                   |
| Contact Number            |
| Additional Contact Number |
| Girl Full Name            |
| Girl Date of Birth        |
| Girl Time of Birth        |
| Girl Place of Birth       |
| Boy Full Name             |
| Boy Date of Birth         |
| Boy Time of Birth         |
| Boy Place of Birth        |
| Status                    |
| Admin Note                |
| Last Updated              |

## Sheet 4: ActivityLog

This sheet is useful for simple tracking.

| Column          |
| --------------- |
| Log ID          |
| Date            |
| Time            |
| Action          |
| Request Number  |
| Changed By      |
| Previous Status |
| New Status      |
| Note            |

Example actions:

```text
FORM_SUBMITTED
STATUS_UPDATED
USER_CREATED
PASSWORD_ACTIVATED
```

## Sheet 5: Settings

| Key                  | Value        |
| -------------------- | ------------ |
| APP_NAME             | Swasthi Life |
| NEXT_HADAHAN_NUMBER  | 1            |
| NEXT_PORONDAM_NUMBER | 1            |
| DEFAULT_LANGUAGE     | SINHALA      |

---

# 17. Request Number Format

Use separate request number sequences.

```text
HAD-2026-000001
POR-2026-000001
```

Example:

| Form Type | Request Number    |
| --------- | ----------------- |
| Hadahan   | `HAD-2026-000024` |
| Porondam  | `POR-2026-000013` |

Store an additional internal ID for technical use.

Example:

```text
d95fb891-6d8f-4850-a58d-8cb10bd04136
```

The user only needs to see the friendly request number.

---

# 18. Backend API Endpoints

## Authentication

```text
POST /api/auth/check-username
POST /api/auth/activate
POST /api/auth/login
POST /api/auth/change-password
GET  /api/auth/me
```

## User Form Submission

```text
POST /api/forms/hadahan
POST /api/forms/porondam
```

## Guest Form Submission

```text
POST /api/guest/forms/hadahan
POST /api/guest/forms/porondam
```

## Admin Requests

```text
GET   /api/admin/requests
GET   /api/admin/requests/{request_number}
PATCH /api/admin/requests/{request_number}/status
GET   /api/admin/dashboard
```

## Admin User Management

```text
GET  /api/admin/users
POST /api/admin/users
```

## Request Filtering

Example:

```text
GET /api/admin/requests?status=NEW&form_type=PORONDAM
```

---

# 19. Backend Folder Structure

```text
backend/
  app/
    main.py
    config.py

    routes/
      auth.py
      forms.py
      guest_forms.py
      admin_requests.py
      admin_users.py

    schemas/
      auth.py
      hadahan.py
      porondam.py
      admin.py

    services/
      google_sheets.py
      authentication.py
      request_numbers.py
      dashboard.py

    middleware/
      require_login.py
      require_admin.py

    utils/
      password_hash.py
      datetime_utils.py
      constants.py
```

---

# 20. Frontend Folder Structure

```text
frontend/
  src/
    main.tsx
    App.tsx

    pages/
      shared/
        LanguageSelection.tsx
        Welcome.tsx
        Login.tsx
        ActivateAccount.tsx
        SubmissionSuccess.tsx

      user/
        UserHome.tsx
        HadahanForm.tsx
        HadahanReview.tsx
        PorondamContact.tsx
        PorondamGirl.tsx
        PorondamBoy.tsx
        PorondamReview.tsx
        UserSettings.tsx
        AppInfo.tsx

      admin/
        ActiveRequests.tsx
        RequestDetails.tsx
        Dashboard.tsx
        RequestHistory.tsx
        UserManagement.tsx
        CreateUser.tsx
        AdminSettings.tsx

      guest/
        GuestFormSelection.tsx
        GuestHadahanForm.tsx
        GuestPorondamForm.tsx

    components/
      LanguageToggle.tsx
      FormInput.tsx
      PhoneInput.tsx
      DatePicker.tsx
      TimePicker.tsx
      MenuTile.tsx
      RequestCard.tsx
      StatusBadge.tsx
      DashboardCard.tsx
      FilterModal.tsx
      ConfirmDialog.tsx

    locales/
      en.json
      si.json

    services/
      api.ts
      auth.ts
      forms.ts
      admin.ts

    constants/
      statuses.ts
      roles.ts
```

---

# 21. Form Validation Rules

Validation should happen in the frontend and backend.

## General Rules

| Field                     | Validation                           |
| ------------------------- | ------------------------------------ |
| Full Name                 | Required                             |
| Address                   | Required                             |
| Contact Number            | Required                             |
| Additional Contact Number | Optional                             |
| Date of Birth             | Required and cannot be a future date |
| Time of Birth             | Required                             |
| Place of Birth            | Required                             |
| Preferred Language        | Must be `ENGLISH` or `SINHALA`       |

## Phone Number Rule

Allow common phone-number formats:

```text
0771234567
+94771234567
0912258468
```

Remove unnecessary spaces before saving.

## Password Rule

For the first version:

| Rule             | Value                       |
| ---------------- | --------------------------- |
| Minimum length   | 8 characters                |
| Confirm password | Must match                  |
| Storage          | Save only the password hash |

Do not save the original password.

---

# 22. Frontend Validation Messages

## English

```text
Full name is required.
Address is required.
Contact number is required.
Please enter a valid contact number.
Date of birth is required.
Date of birth cannot be in the future.
Time of birth is required.
Place of birth is required.
Passwords do not match.
Your form has been submitted successfully.
```

## Sinhala

```text
සම්පූර්ණ නම ඇතුළත් කරන්න.
ලිපිනය ඇතුළත් කරන්න.
දුරකථන අංකය ඇතුළත් කරන්න.
වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.
උපන් දිනය ඇතුළත් කරන්න.
උපන් දිනය අනාගත දිනයක් විය නොහැක.
උපන් වේලාව ඇතුළත් කරන්න.
උපන් ස්ථානය ඇතුළත් කරන්න.
මුරපද දෙක ගැළපෙන්නේ නැත.
ඔබගේ පෝරමය සාර්ථකව යොමු කර ඇත.
```

---

# 23. Login Flow

```text
User Enters Username
        |
        v
Backend Checks Users Sheet
        |
        +---- Status = PENDING
        |          |
        |          v
        |   Show Create Password Screen
        |          |
        |          v
        |   Save Password Hash
        |          |
        |          v
        |   Change Status to ACTIVE
        |
        +---- Status = ACTIVE
                   |
                   v
            Show Password Screen
                   |
                   v
            Check Password Hash
                   |
                   v
              Log User In
```

---

# 24. Form Submission Flow

```text
User Selects Form
        |
        v
User Enters Details
        |
        v
Frontend Validation
        |
        v
Review Screen
        |
        v
Submit to FastAPI Backend
        |
        v
Backend Validation
        |
        v
Generate Request Number
        |
        v
Add Date, Time, Source, and NEW Status
        |
        v
Append Row to Google Sheet
        |
        v
Show Success Message and Request Number
```

---

# 25. Admin Status Update Flow

```text
Admin Opens Request
        |
        v
Admin Selects Status
        |
        v
Backend Checks Login Token
        |
        v
Backend Checks ADMIN Role
        |
        v
Update Matching Sheet Row
        |
        v
Add ActivityLog Record
        |
        v
Show Updated Status
```

---

# 26. Visual Design Direction

Use a simple and trustworthy style.

Suggested design:

| Item             | Recommendation                      |
| ---------------- | ----------------------------------- |
| Background       | White or light cream                |
| Main colour      | Deep maroon                         |
| Secondary colour | Gold                                |
| Text colour      | Dark grey                           |
| Buttons          | Rounded corners                     |
| Form layout      | One column                          |
| Mobile spacing   | Large enough for easy tapping       |
| Sinhala font     | Use a clear Sinhala-compatible font |
| Icons            | Simple outline icons                |

The colour direction can match the printed Swasthi Life form and its traditional style.

Avoid adding too many decorative items. The app should remain easy to read.

---

# 27. Testing Checklist Before Release

## Login Testing

* Admin can create a user.
* New user appears with `PENDING` status.
* Pending user can create a password.
* Status changes to `ACTIVE`.
* Active user can log in again.
* Wrong password is rejected.
* Normal user cannot open admin pages.

## Form Testing

* Hadahan form accepts correct details.
* Porondam form requires girl and boy details.
* Missing required fields show errors.
* Future birth dates are rejected.
* Sinhala text is saved correctly.
* English text is saved correctly.
* Request number is generated correctly.
* Submission date and time are correct.

## Admin Testing

* New requests appear in the active request list.
* Admin can open full details.
* Admin can change request status.
* Done requests appear in request history.
* Filters work correctly.
* Dashboard counts update correctly.

## Google Sheets Testing

* New Hadahan row is added correctly.
* New Porondam row is added correctly.
* Sinhala characters are saved correctly.
* Status updates change the correct row.
* User creation adds a new Users row.
* Activity log records are added correctly.

---

# 28. Decisions Required Before Coding

Confirm these items before development starts:

1. Should the frontend be a responsive browser-based app or an installable mobile app? MObile APP 
2. Do you want one optional additional phone number or two optional additional phone numbers?  YES only one
3. Is the address required for the Porondam form? NO
4. Should users see their previous requests? NO
5. Should guest users see only a request number, or should they be able to check the status later? Cannt
6. Is an admin note required when selecting `ON_HOLD` or `CANCELLED`? YES
7. Can a completed request be reopened? YES ONLY BY ADMIN
8. Should the app use the Swasthi Life logo shown on the printed form? 
9. Should the public guest form include a simple CAPTCHA? NO
10. Should the organisation phone numbers and address from the printed form appear inside the App Info screen? NO
`