from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
from datetime import datetime

from app.core.config import settings
from app.core.database import engine
from app.models import survey
from app.routes import survey_routes, response_routes, analytics_routes, ai_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("app.log") if settings.ENVIRONMENT == "production" else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create database tables
survey.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Modern Survey Management System",
    version="2.0.0",
    description="AI-powered survey management system with advanced analytics",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url)}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0"
    }

# API routes
app.include_router(survey_routes.router, prefix="/api", tags=["surveys"])
app.include_router(response_routes.router, prefix="/api", tags=["responses"])
app.include_router(analytics_routes.router, prefix="/api", tags=["analytics"])
app.include_router(ai_routes.router, prefix="/api", tags=["ai"])

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Survey Management System starting up in {settings.ENVIRONMENT} mode")
    logger.info(f"Database URL: {settings.DATABASE_URL[:20]}...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Survey Management System shutting down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
