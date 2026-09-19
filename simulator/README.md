# ByteForce | Emergency Scenario & Sensor Simulator CLI

Standalone Python CLI tool to inject deterministic emergency events into the backend ingestion gateway.

## Usage
Run with standard Python 3:

```bash
# Scenario A: 5-Alarm Industrial Chemical Fire
python simulator/scenario_simulator.py --scenario chemical_fire

# Scenario B: Flash Flood Sensor Alert
python simulator/scenario_simulator.py --scenario flash_flood

# Scenario C: Road Collision on Highway
python simulator/scenario_simulator.py --scenario highway_collision

# Dry-run inspection (prints JSON without making HTTP requests)
python simulator/scenario_simulator.py --scenario chemical_fire --dry-run

# Custom backend URL
python simulator/scenario_simulator.py --scenario chemical_fire --incident-url http://localhost:8000/api/v1/incidents/report --sensor-url http://localhost:8000/api/v1/sensors/telemetry
```
