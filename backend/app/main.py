from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, auth, diagrams, health
from app.core.config import get_settings
from app.notations import load_all as load_all_notations


def create_app() -> FastAPI:
    settings = get_settings()
    load_all_notations()

    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(diagrams.router)
    app.include_router(ai.router)
    return app


app = create_app()
