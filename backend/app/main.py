from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import admin_requests, admin_users, auth, forms, guest_forms

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


@app.get("/api/health")
async def health():
    return {"status": "ok"}
