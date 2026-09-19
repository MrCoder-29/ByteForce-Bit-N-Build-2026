# ByteForce | Member 4: Data Ingestion & Responder CAD Module

## Overview
This module provides the multi-channel incident collection, IoT sensor telemetry simulation, synthetic emergency scenario generator, and field responder mobile terminal for **PS-9: Intelligent Emergency Response & Resource Coordination Platform**.

## Features
1. **Citizen Emergency SOS Portal** (`/citizen`):
   - High-urgency mobile form with emergency category cards (Fire, Medical, Crash, Flood, HAZMAT, Collapse).
   - "Use My GPS" 1-click geolocation with coordinate accuracy.
   - 911 Voice Note / Audio recorder with animated waveform and simulated Speech-to-Text transcript.
   - Camera / simulated photo evidence attachment.
   - Immediate SOS Reference Code generation (`#SOS-xxxxx`) with citizen safety guidance and simulated SMS alert.
2. **Field Responder Terminal** (`/responder`):
   - Mobile/tablet CAD view for field units (Engine 7, Medic 4, Hazmat 1, Boat 2).
   - Dynamic dispatch dossier: severity badge, casualties, consolidated duplicates counter, caller transcripts.
   - Interactive **AI Tactical SOP & Safety Checklist**.
   - Destination address, GPS coords, simulated distance & ETA (~3 mins).
   - Progressive lifecycle actions: `[Acknowledge & En Route]` -> `[Arrived On Scene]` -> `[Resolve Incident]`.
3. **Demo Emergency Scenario Simulator** (`/simulator`):
   - One-click trigger buttons for Hackathon Scenarios:
     - **Scenario A:** 5-Alarm Industrial Chemical Fire (1 911 audio transcript, 3 clustered citizen reports, 1 toxic gas sensor spike).
     - **Scenario B:** Flash Flood Sensor Alert & Stranded Motorists (Ultrasonic hydro sensor + 2 citizen reports).
     - **Scenario C:** Road Collision on Highway (Multi-vehicle pileup with entrapped victims + fuel leak).
   - Chaos Burst random incident injector.
   - Live audit stream of transmitted payloads with raw JSON inspection.
4. **IoT Environmental Sensor Fleet** (`/sensors`):
   - Visual telemetry gauges for Water Culvert, Chemical VOC, Thermal Infrared, and Seismic Vibration.
   - Anomaly spike triggers and background telemetry heartbeat stream.
5. **Side-by-Side Presentation Split Mode** (`/split`):
   - Shows Citizen Ingestion on the left and Field Responder CAD on the right to demonstrate the complete real-time dispatch loop to judges in 30 seconds.

## Running the Web Module
```bash
cd ingestion-responder
npm install
npm run dev
```
The app runs at `http://localhost:5174`.

## Backend Integration
- Target endpoint URL is configurable via the UI or `.env`:
  `VITE_API_URL=http://localhost:8000`
- If Member 2's backend is not running, the module automatically activates its resilient in-memory mock adapter with sound effects and zero runtime errors.
