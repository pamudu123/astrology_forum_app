"""
Swasthi Life Form API

Available Endpoints:
1. Health Check:
   - GET    /api/health                                  - Check API health status

2. Authentication (/api/auth):
   - POST   /api/auth/check-username                     - Check if username exists and status
   - POST   /api/auth/activate                           - Activate account and set password
   - POST   /api/auth/login                              - Login and retrieve JWT access token
   - GET    /api/auth/me                                 - Retrieve logged-in user profile

3. User Forms (/api/forms):
   - POST   /api/forms/hadahan                           - Submit authenticated Hadahan form
   - POST   /api/forms/porondam                          - Submit authenticated Porondam form

4. Guest Forms (/api/guest/forms):
   - POST   /api/guest/forms/hadahan                     - Submit unauthenticated Hadahan form
   - POST   /api/guest/forms/porondam                    - Submit unauthenticated Porondam form

5. Admin Requests (/api/admin):
   - GET    /api/admin/requests                          - List all submitted forms
   - GET    /api/admin/requests/{request_number}         - Get specific request details
   - PATCH  /api/admin/requests/{request_number}/status  - Update request status/notes
   - GET    /api/admin/dashboard                         - Get status-wise request counts

6. Admin Users (/api/admin/users):
   - GET    /api/admin/users                             - List all system users
   - POST   /api/admin/users                             - Create/Register a new user

7. Admin Notifications (/api/admin/notifications):
   - POST   /api/admin/notifications/register-token      - Register device push token
   - POST   /api/admin/notifications/unregister-token    - Remove device push token
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import admin_notifications, admin_requests, admin_users, auth, forms, guest_forms

app = FastAPI(title="Swasthi Life Form API")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(forms.router)
app.include_router(guest_forms.router)
app.include_router(admin_requests.router)
app.include_router(admin_users.router)
app.include_router(admin_notifications.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
