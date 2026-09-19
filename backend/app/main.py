import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.seed_data import seed_resources_if_empty
from app.websocket_manager import manager as ws_manager
from app.escalation import monitor_sla_escalations
from app.routers import incidents, resources, dispatch, analytics, simulation

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    logger.info("Initializing ResQSync Database Tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Seeding synthetic resources if database is empty...")
    seed_resources_if_empty()

    logger.info("Launching SLA Escalation Background Task...")
    escalation_task = asyncio.create_task(monitor_sla_escalations())

    yield

    # --- SHUTDOWN LOGIC ---
    logger.info("Shutting down background tasks...")
    escalation_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PS-9 Intelligent Emergency Response & Resource Coordination Platform API",
    lifespan=lifespan
)

# CORS Middleware (allows React frontend on any port/origin during hackathon)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(dispatch.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health & Status"])
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health", tags=["Health & Status"])
def health_check():
    return {"status": "healthy"}


# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial welcome payload
        await websocket.send_json({
            "event": "connection_established",
            "message": "Connected to ResQSync Real-Time Emergency Event Stream"
        })
        while True:
            # Keep connection open and accept ping/messages from clients
            data = await websocket.receive_text()
            logger.debug(f"Received WS message: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
