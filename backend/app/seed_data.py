import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models import Resource
from app.config import settings

logger = logging.getLogger("seed_data")

INITIAL_RESOURCES = [
    # --- AMBULANCES ---
    {
        "identifier": "AMB-101",
        "name": "Metro Medic 1",
        "type": "Ambulance",
        "capabilities": ["Advanced Life Support", "Patient Transport", "Cardiac Care", "Pediatric Care"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.012,
        "longitude": settings.DEFAULT_CENTER_LON - 0.015,
        "capacity": 2,
        "contact_number": "+1-555-0101"
    },
    {
        "identifier": "AMB-102",
        "name": "Metro Medic 2",
        "type": "Ambulance",
        "capabilities": ["Basic Life Support", "Patient Transport"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.018,
        "longitude": settings.DEFAULT_CENTER_LON + 0.022,
        "capacity": 2,
        "contact_number": "+1-555-0102"
    },
    {
        "identifier": "AMB-103",
        "name": "Trauma Rescue Ambulance 3",
        "type": "Ambulance",
        "capabilities": ["Advanced Life Support", "Trauma Unit", "Extrication"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.035,
        "longitude": settings.DEFAULT_CENTER_LON + 0.010,
        "capacity": 2,
        "contact_number": "+1-555-0103"
    },
    {
        "identifier": "AMB-104",
        "name": "Downtown Express Ambulance",
        "type": "Ambulance",
        "capabilities": ["Advanced Life Support", "Patient Transport"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.005,
        "longitude": settings.DEFAULT_CENTER_LON - 0.008,
        "capacity": 2,
        "contact_number": "+1-555-0104"
    },

    # --- FIRE TRUCKS ---
    {
        "identifier": "FIRE-201",
        "name": "Station 4 Ladder Truck",
        "type": "Fire Truck",
        "capabilities": ["Fire Suppression", "High Rise Ladder", "Search & Rescue"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.008,
        "longitude": settings.DEFAULT_CENTER_LON + 0.014,
        "capacity": 6,
        "contact_number": "+1-555-0201"
    },
    {
        "identifier": "FIRE-202",
        "name": "Heavy Engine 2",
        "type": "Fire Truck",
        "capabilities": ["Fire Suppression", "Water Pumping", "Extrication"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.025,
        "longitude": settings.DEFAULT_CENTER_LON - 0.019,
        "capacity": 4,
        "contact_number": "+1-555-0202"
    },
    {
        "identifier": "FIRE-203",
        "name": "Industrial Tanker 9",
        "type": "Fire Truck",
        "capabilities": ["Fire Suppression", "Foam Suppression", "Hazmat"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.040,
        "longitude": settings.DEFAULT_CENTER_LON - 0.030,
        "capacity": 4,
        "contact_number": "+1-555-0203"
    },

    # --- RESCUE BOATS ---
    {
        "identifier": "BOAT-301",
        "name": "Harbor Rescue Boat 1",
        "type": "Rescue Boat",
        "capabilities": ["Water Rescue", "Flood Support", "Diver Unit", "Advanced Life Support"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.020,
        "longitude": settings.DEFAULT_CENTER_LON + 0.035,
        "capacity": 8,
        "contact_number": "+1-555-0301"
    },
    {
        "identifier": "BOAT-302",
        "name": "Coastal Swiftboat 4",
        "type": "Rescue Boat",
        "capabilities": ["Water Rescue", "Flood Support", "Evacuation"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.030,
        "longitude": settings.DEFAULT_CENTER_LON + 0.040,
        "capacity": 12,
        "contact_number": "+1-555-0302"
    },

    # --- POLICE PATROLS ---
    {
        "identifier": "POL-401",
        "name": "Central Police Patrol 12",
        "type": "Police Patrol",
        "capabilities": ["Traffic Control", "Perimeter Security", "Crowd Control"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.002,
        "longitude": settings.DEFAULT_CENTER_LON - 0.003,
        "capacity": 2,
        "contact_number": "+1-555-0401"
    },
    {
        "identifier": "POL-402",
        "name": "Highway Patrol Unit 8",
        "type": "Police Patrol",
        "capabilities": ["Traffic Control", "High Speed Intercept", "Extrication"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.040,
        "longitude": settings.DEFAULT_CENTER_LON - 0.010,
        "capacity": 2,
        "contact_number": "+1-555-0402"
    },
    {
        "identifier": "POL-403",
        "name": "Tactical SWAT Command",
        "type": "Police Patrol",
        "capabilities": ["Perimeter Security", "Tactical Response", "Crisis Negotiation"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.015,
        "longitude": settings.DEFAULT_CENTER_LON - 0.025,
        "capacity": 8,
        "contact_number": "+1-555-0403"
    },

    # --- HAZMAT & SPECIAL UNITS ---
    {
        "identifier": "HAZ-501",
        "name": "Regional Hazmat Containment Unit",
        "type": "Hazmat Unit",
        "capabilities": ["Hazmat", "Hazmat Isolation", "Decontamination", "Chemical Detection"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.012,
        "longitude": settings.DEFAULT_CENTER_LON - 0.035,
        "capacity": 4,
        "contact_number": "+1-555-0501"
    },

    # --- HOSPITALS / FACILITIES ---
    {
        "identifier": "HOSP-01",
        "name": "Central General Medical Center",
        "type": "Hospital",
        "capabilities": ["Advanced Life Support", "ICU Beds", "Level-1 Trauma", "Burn Unit", "Patient Transport"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT + 0.005,
        "longitude": settings.DEFAULT_CENTER_LON + 0.005,
        "capacity": 45, # 45 available ICU beds
        "contact_number": "+1-555-0900"
    },
    {
        "identifier": "HOSP-02",
        "name": "St. Jude Emergency Hospital",
        "type": "Hospital",
        "capabilities": ["Advanced Life Support", "ICU Beds", "Pediatric Care", "Emergency ER"],
        "status": "Available",
        "latitude": settings.DEFAULT_CENTER_LAT - 0.020,
        "longitude": settings.DEFAULT_CENTER_LON - 0.015,
        "capacity": 22,
        "contact_number": "+1-555-0901"
    }
]

def seed_resources_if_empty(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        existing_count = db.query(Resource).count()
        if existing_count == 0:
            logger.info("Seeding synthetic emergency resources into database...")
            for res_data in INITIAL_RESOURCES:
                res = Resource(**res_data)
                db.add(res)
            db.commit()
            logger.info(f"Successfully seeded {len(INITIAL_RESOURCES)} emergency resources.")
        else:
            logger.info(f"Database already contains {existing_count} resources. Skipping seed.")
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_resources_if_empty()
