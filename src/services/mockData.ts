import { Incident, ResourceUnit, AlertNotice, AnalyticsData, DispatchRecommendation, SituationReport } from '../types/emergency';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-2026-8801",
    title: "Major Chemical Leak in Industrial Sector 4",
    type: "HAZMAT",
    severity: "CRITICAL",
    status: "TRIAGED",
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: "Plot 42, MIDC Industrial Area, Andheri East",
      landmark: "Near Chemical Refinery Gate 2",
      cityZone: "North Zone"
    },
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    source: "IOT_SENSOR",
    duplicateCount: 5,
    duplicates: [
      { id: "DUP-1", timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), source: "911_HOTLINE", rawText: "Toxic gas odor spreading near MIDC complex." },
      { id: "DUP-2", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), source: "CITIZEN_APP", rawText: "Fumes visible, workers coughing." }
    ],
    aiSummary: "High concentration Ammonia sensor spike verified by 5 citizen calls. Risk of toxic cloud dispersion. Immediate evacuation & Hazmat isolation needed.",
    riskScore: 94,
    requiredCapabilities: ["Hazmat Containment", "Chemical Suits", "Evacuation Transport"],
    slaMinutesRemaining: 4,
    callerContact: "+91 98200 11223",
    mediaUrls: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop"],
    notes: ["Automated alarm triggered at 14:10", "Hazmat Unit HZ-01 recommended"],
    estimatedCasualties: {
      injured: 12,
      fatalities: 0,
      trapped: 4,
      summary: "12 workers experiencing chemical respiratory distress, 4 trapped in storage bay 3."
    },
    timeline: [
      { timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), label: "IoT Sensor Alarm Triggered", details: "Ammonia sensor A-42 reading exceeded 350 ppm.", type: "CALL" },
      { timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), label: "AI Severity & Triage Classification", details: "Assigned CRITICAL risk rating (94/100). Duplicate calls grouped.", type: "TRIAGE" },
      { timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), label: "Recommended Unit Hazmat Alpha", details: "Hazmat Unit HZ-01 selected as top match (Score 98%).", type: "DISPATCH" }
    ]
  },
  {
    id: "INC-2026-8802",
    title: "Multi-Vehicle Highway Pileup on Western Express",
    type: "ACCIDENT",
    severity: "CRITICAL",
    status: "PENDING",
    location: {
      lat: 19.1197,
      lng: 72.8464,
      address: "Western Express Highway, Flyover Southbound",
      landmark: "Near Vile Parle Flyover",
      cityZone: "Central Zone"
    },
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    source: "CITIZEN_APP",
    duplicateCount: 12,
    duplicates: [
      { id: "DUP-3", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), source: "911_HOTLINE", rawText: "3 cars and 1 bus involved, multiple injuries." }
    ],
    aiSummary: "Severe traffic collision involving 4 vehicles including 1 passenger bus. Trapped passengers reported. Heavy traffic gridlock forming.",
    riskScore: 89,
    requiredCapabilities: ["Advanced Life Support", "Heavy Hydraulic Extrication", "Traffic Control"],
    slaMinutesRemaining: 2,
    callerContact: "+91 98921 54321",
    notes: ["Hydraulic cutters requested by first responder"],
    estimatedCasualties: {
      injured: 8,
      fatalities: 1,
      trapped: 3,
      summary: "8 injured passengers, 1 deceased driver, 3 trapped inside vehicle frame."
    },
    timeline: [
      { timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), label: "First Citizen 911 Call Received", details: "Caller reported high-speed multi-car crash on flyover.", type: "CALL" },
      { timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), label: "12 Duplicate Calls Consolidated", details: "AI aggregated reports into single master incident file.", type: "TRIAGE" }
    ]
  },
  {
    id: "INC-2026-8803",
    title: "Residential Building Fire on 5th Floor",
    type: "FIRE",
    severity: "HIGH",
    status: "DISPATCHED",
    location: {
      lat: 19.0330,
      lng: 72.8570,
      address: "Shanti Towers, B-Wing, Dadar West",
      landmark: "Opposite Dadar Railway Station",
      cityZone: "South Zone"
    },
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    source: "911_HOTLINE",
    duplicateCount: 8,
    aiSummary: "Electrical short circuit initiated flames on 5th floor balcony. Flame spreading to 6th floor. Building evacuation underway.",
    riskScore: 78,
    requiredCapabilities: ["High-Reach Ladder", "Fire Extinguishing", "Smoke Mask Breathing Kits"],
    assignedUnitId: "UNIT-FIRE-02",
    assignedUnitCallsign: "Engine 14 (Dadar)",
    slaMinutesRemaining: 12,
    callerContact: "+91 97690 88900",
    notes: ["Engine 14 dispatched at 14:15", "Aerial ladder ladder requested"],
    estimatedCasualties: {
      injured: 3,
      fatalities: 0,
      trapped: 2,
      summary: "3 residents treated for minor smoke inhalation, 2 residents awaiting ladder rescue on 6th floor balcony."
    },
    timeline: [
      { timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(), label: "Emergency Hotline Call", details: "Building watchman reported heavy smoke from 5th floor.", type: "CALL" },
      { timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), label: "AI Priority High Assigned", details: "High-reach ladder capability flagged mandatory.", type: "TRIAGE" },
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), label: "Engine 14 Dispatched", details: "Unit UNIT-FIRE-02 dispatched from Dadar Station.", type: "DISPATCH" }
    ]
  },
  {
    id: "INC-2026-8804",
    title: "Urban Flash Flooding in Underpass",
    type: "FLOOD",
    severity: "HIGH",
    status: "EN_ROUTE",
    location: {
      lat: 19.0600,
      lng: 72.8360,
      address: "Milan Subway Underpass, Santacruz",
      landmark: "Milan Subway Entry",
      cityZone: "West Zone"
    },
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    source: "SOCIAL_MEDIA",
    duplicateCount: 19,
    aiSummary: "Heavy rainfall causing 4 feet of water accumulation. 2 vehicles submerged. Rescue boat deployed for trapped drivers.",
    riskScore: 71,
    requiredCapabilities: ["Inflatable Rescue Boat", "Water Pumping", "Submerged Rescue"],
    assignedUnitId: "UNIT-RESCUE-01",
    assignedUnitCallsign: "Rescue Boat Alpha",
    slaMinutesRemaining: 18,
    callerContact: "+91 98199 44332",
    notes: ["Pumping station notified to increase outflow"],
    estimatedCasualties: {
      injured: 0,
      fatalities: 0,
      trapped: 2,
      summary: "2 drivers stranded on car roof inside flooded underpass."
    },
    timeline: [
      { timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), label: "Social Media Post Detected", details: "AI crawler flagged video of submerged subway underpass.", type: "CALL" },
      { timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), label: "Rescue Boat Alpha Dispatched", details: "Inflatable boat team deployed to extract drivers.", type: "DISPATCH" }
    ]
  },
  {
    id: "INC-2026-8805",
    title: "Cardiac Emergency at Shopping Mall",
    type: "MEDICAL",
    severity: "MEDIUM",
    status: "ON_SCENE",
    location: {
      lat: 19.1760,
      lng: 72.8360,
      address: "Infinity Mall, Food Court 3rd Floor, Malad West",
      landmark: "Near Elevators",
      cityZone: "North Zone"
    },
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: "CITIZEN_APP",
    duplicateCount: 2,
    aiSummary: "58-year-old male collapsed with chest pain. Bystander administering CPR. Defibrillator requested.",
    riskScore: 62,
    requiredCapabilities: ["Advanced Cardiac Life Support", "AED Defibrillator", "Paramedic"],
    assignedUnitId: "UNIT-MED-01",
    assignedUnitCallsign: "Medic 101",
    slaMinutesRemaining: 0,
    callerContact: "+91 99300 77112",
    notes: ["Medic 101 on scene, patient stabilized"],
    estimatedCasualties: {
      injured: 1,
      fatalities: 0,
      trapped: 0,
      summary: "1 cardiac patient receiving bystander CPR and paramedic care."
    },
    timeline: [
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), label: "Citizen SOS App Triggered", details: "Mall visitor requested emergency medical assistance.", type: "CALL" },
      { timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), label: "Medic 101 Dispatched", details: "ALS ambulance assigned with AED defibrillator.", type: "DISPATCH" },
      { timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), label: "Medic 101 On Scene", details: "Paramedic team arrived on 3rd floor food court.", type: "ON_SCENE" }
    ]
  },
  {
    id: "INC-2026-8806",
    title: "Commercial Storefront Armed Robbery Attempt",
    type: "CRIME",
    severity: "MEDIUM",
    status: "PENDING",
    location: {
      lat: 19.0178,
      lng: 72.8478,
      address: "Jewelry Market, Zaveri Bazar, Kalbadevi",
      landmark: "Main Bazaar Gate",
      cityZone: "South Zone"
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    source: "911_HOTLINE",
    duplicateCount: 3,
    aiSummary: "Silent panic button pressed at gold shop. 2 suspects reportedly armed. Store manager locked inside safe room.",
    riskScore: 65,
    requiredCapabilities: ["Tactical Patrol", "Perimeter Containment", "Armed Intervention"],
    slaMinutesRemaining: 6,
    callerContact: "+91 98210 99887",
    notes: ["Surveillance camera feed requested"],
    estimatedCasualties: {
      injured: 0,
      fatalities: 0,
      trapped: 1,
      summary: "Store manager locked inside safe room, no physical injuries reported."
    }
  }
];

export const INITIAL_RESOURCE_UNITS: ResourceUnit[] = [
  {
    id: "UNIT-HZ-01",
    callsign: "Hazmat Response Alpha",
    type: "HAZMAT_UNIT",
    status: "AVAILABLE",
    location: { lat: 19.0800, lng: 72.8700, address: "MIDC Fire & Rescue HQ" },
    personnelCount: 6,
    capabilities: ["Hazmat Containment", "Chemical Suits", "Evacuation Transport", "Decontamination"],
    batteryOrFuelPercent: 92,
    contactChannel: "CH-HAZ-1"
  },
  {
    id: "UNIT-MED-01",
    callsign: "Medic 101 (ALS)",
    type: "AMBULANCE",
    status: "ON_SCENE",
    location: { lat: 19.1760, lng: 72.8360, address: "Infinity Mall Malad" },
    personnelCount: 3,
    capabilities: ["Advanced Life Support", "Advanced Cardiac Life Support", "AED Defibrillator", "Paramedic"],
    batteryOrFuelPercent: 78,
    contactChannel: "CH-MED-3",
    currentIncidentId: "INC-2026-8805"
  },
  {
    id: "UNIT-MED-02",
    callsign: "Medic 204 (Trauma)",
    type: "AMBULANCE",
    status: "AVAILABLE",
    location: { lat: 19.1120, lng: 72.8520, address: "Cooper Hospital Base" },
    personnelCount: 4,
    capabilities: ["Advanced Life Support", "Heavy Hydraulic Extrication", "Trauma Transport", "Paramedic"],
    batteryOrFuelPercent: 88,
    contactChannel: "CH-MED-1"
  },
  {
    id: "UNIT-FIRE-01",
    callsign: "Heavy Rescue Engine 05",
    type: "FIRE_ENGINE",
    status: "AVAILABLE",
    location: { lat: 19.1150, lng: 72.8480, address: "Andheri Fire Station" },
    personnelCount: 5,
    capabilities: ["Heavy Hydraulic Extrication", "Fire Extinguishing", "Traffic Control", "Foam Spray"],
    batteryOrFuelPercent: 95,
    contactChannel: "CH-FIRE-2"
  },
  {
    id: "UNIT-FIRE-02",
    callsign: "Engine 14 (Dadar)",
    type: "FIRE_ENGINE",
    status: "DISPATCHED",
    location: { lat: 19.0330, lng: 72.8570, address: "En route to Dadar West" },
    personnelCount: 6,
    capabilities: ["High-Reach Ladder", "Fire Extinguishing", "Smoke Mask Breathing Kits"],
    batteryOrFuelPercent: 84,
    contactChannel: "CH-FIRE-1",
    currentIncidentId: "INC-2026-8803"
  },
  {
    id: "UNIT-POLICE-01",
    callsign: "Eagle Patrol 12",
    type: "POLICE_PATROL",
    status: "AVAILABLE",
    location: { lat: 19.0200, lng: 72.8450, address: "Kalbadevi Beat Office" },
    personnelCount: 3,
    capabilities: ["Tactical Patrol", "Perimeter Containment", "Traffic Control", "Armed Intervention"],
    batteryOrFuelPercent: 65,
    contactChannel: "CH-POL-4"
  },
  {
    id: "UNIT-RESCUE-01",
    callsign: "Rescue Boat Alpha",
    type: "RESCUE_BOAT",
    status: "EN_ROUTE",
    location: { lat: 19.0600, lng: 72.8360, address: "Santacruz Waterways" },
    personnelCount: 4,
    capabilities: ["Inflatable Rescue Boat", "Water Pumping", "Submerged Rescue"],
    batteryOrFuelPercent: 90,
    contactChannel: "CH-RESC-1",
    currentIncidentId: "INC-2026-8804"
  },
  {
    id: "UNIT-DRONE-01",
    callsign: "SkySentinel Scout Drone D-1",
    type: "DRONE",
    status: "AVAILABLE",
    location: { lat: 19.0700, lng: 72.8600, address: "HQ Roof Helipad" },
    personnelCount: 1,
    capabilities: ["Thermal Imaging", "Aerial Reconnaissance", "Loudspeaker Broadcast"],
    batteryOrFuelPercent: 98,
    contactChannel: "CH-DRONE-1"
  }
];

export const INITIAL_ALERTS: AlertNotice[] = [
  {
    id: "ALT-101",
    type: "CRITICAL_INCIDENT",
    title: "Critical Chemical Spill Alert",
    message: "High toxic chemical hazard reported at MIDC Plot 42. Immediate containment unit needed.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    incidentId: "INC-2026-8801",
    severity: "CRITICAL",
    acknowledged: false
  },
  {
    id: "ALT-102",
    type: "SLA_BREACH",
    title: "SLA Warning: Highway Collision",
    message: "2 minutes remaining before SLA breach on Highway Pileup incident.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    incidentId: "INC-2026-8802",
    severity: "HIGH",
    acknowledged: false
  },
  {
    id: "ALT-103",
    type: "RESOURCE_SHORTAGE",
    title: "High Demand: Trauma ALS Ambulances",
    message: "Only 1 ALS Ambulance unit available across North Zone.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    severity: "MEDIUM",
    acknowledged: true
  }
];

export const MOCK_SITUATION_REPORT: SituationReport = {
  generatedAt: new Date().toISOString(),
  overallRiskLevel: "HIGH",
  executiveSummary: "Active emergency operations underway across 4 urban zones. North Zone MIDC chemical leak presents the highest immediate hazard due to atmospheric vapor dispersion. Heavy vehicular traffic along Western Express Highway has degraded trauma ambulance response times by 3.2 minutes.",
  criticalBottlenecks: [
    "North Zone: Heavy Hazmat containment demand; Hazmat Alpha is currently unassigned.",
    "Central Zone: Highway gridlock restricting vehicle movement near Vile Parle Flyover.",
    "Fleet Deficit: Heavy Hydraulic Extrication units operating at 80% capacity."
  ],
  aiRecommendations: [
    "Prioritize immediate deployment of Hazmat Alpha (UNIT-HZ-01) to MIDC Industrial Plot 42.",
    "Re-route incoming ALS Ambulances via Eastern Express corridor to bypass Vile Parle gridlock.",
    "Activate reserve drone squad D-1 for thermal plume tracing over Andheri East."
  ],
  activeZoneThreats: [
    { zone: "North Zone (MIDC)", threat: "Chemical Gas Dispersion", level: "CRITICAL" },
    { zone: "Central Zone (WEH)", threat: "Multi-Vehicle Traffic Blockade", level: "CRITICAL" },
    { zone: "South Zone (Dadar)", threat: "High-Rise Fire Spreading", level: "HIGH" },
    { zone: "West Zone (Santacruz)", threat: "Subway Underpass Submersion", level: "HIGH" }
  ]
};

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalIncidents: 42,
  activeIncidents: 6,
  resolvedIncidents: 36,
  avgResponseTimeMin: 4.8,
  availableUnits: 5,
  dispatchedUnits: 3,
  incidentsByType: [
    { type: 'Accidents', count: 14, color: '#f97316' },
    { type: 'Medical', count: 11, color: '#3b82f6' },
    { type: 'Fire', count: 8, color: '#ef4444' },
    { type: 'Hazmat', count: 4, color: '#a855f7' },
    { type: 'Flood', count: 3, color: '#06b6d4' },
    { type: 'Crime', count: 2, color: '#eab308' },
  ],
  severityDistribution: [
    { severity: 'Critical', count: 2, color: '#ef4444' },
    { severity: 'High', count: 2, color: '#f97316' },
    { severity: 'Medium', count: 2, color: '#eab308' },
    { severity: 'Low', count: 0, color: '#3b82f6' },
  ],
  responseTimeTrends: [
    { time: '08:00', avgMin: 6.2, targetMin: 5.0 },
    { time: '10:00', avgMin: 5.5, targetMin: 5.0 },
    { time: '12:00', avgMin: 4.9, targetMin: 5.0 },
    { time: '14:00', avgMin: 4.2, targetMin: 5.0 },
    { time: '16:00', avgMin: 4.8, targetMin: 5.0 },
  ],
  resourceUtilization: [
    { type: 'Ambulance', available: 1, deployed: 1, total: 2 },
    { type: 'Fire Engine', available: 1, deployed: 1, total: 2 },
    { type: 'Police Patrol', available: 1, deployed: 0, total: 1 },
    { type: 'Hazmat Unit', available: 1, deployed: 0, total: 1 },
    { type: 'Rescue Boat', available: 0, deployed: 1, total: 1 },
    { type: 'Drone', available: 1, deployed: 0, total: 1 },
  ],
  areaDensity: [
    { area: 'North Zone (Andheri/MIDC)', incidents: 18, riskLevel: 'High' },
    { area: 'Central Zone (WEH)', incidents: 12, riskLevel: 'High' },
    { area: 'South Zone (Dadar/Zaveri)', incidents: 8, riskLevel: 'Medium' },
    { area: 'West Zone (Santacruz)', incidents: 4, riskLevel: 'Low' },
  ],
  situationReport: MOCK_SITUATION_REPORT
};

export function calculateMockRecommendations(incident: Incident, units: ResourceUnit[]): DispatchRecommendation[] {
  return units
    .filter(u => u.status === 'AVAILABLE')
    .map(unit => {
      // Calculate haversine distance
      const dLat = (unit.location.lat - incident.location.lat) * (Math.PI / 180);
      const dLng = (unit.location.lng - incident.location.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(incident.location.lat * (Math.PI / 180)) * Math.cos(unit.location.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Math.round((6371 * c) * 10) / 10;

      // Estimate ETA assuming average urban emergency vehicle speed of 35 km/h
      const etaMinutes = Math.max(2, Math.round((distanceKm / 35) * 60));

      // Calculate matching capabilities
      const matchedCapabilities = unit.capabilities.filter(cap =>
        incident.requiredCapabilities.some(req => req.toLowerCase().includes(cap.toLowerCase()) || cap.toLowerCase().includes(req.toLowerCase()))
      );

      const missingCapabilities = incident.requiredCapabilities.filter(req =>
        !unit.capabilities.some(cap => cap.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(cap.toLowerCase()))
      );

      // AI Match score calculation
      let score = 100;
      score -= distanceKm * 4; // deduct for distance
      score += matchedCapabilities.length * 15; // reward matching skills
      if (missingCapabilities.length > 0) score -= 10;

      // Unit type matching boost
      if (incident.type === 'HAZMAT' && unit.type === 'HAZMAT_UNIT') score += 20;
      if (incident.type === 'MEDICAL' && unit.type === 'AMBULANCE') score += 20;
      if (incident.type === 'FIRE' && unit.type === 'FIRE_ENGINE') score += 20;
      if (incident.type === 'FLOOD' && unit.type === 'RESCUE_BOAT') score += 20;
      if (incident.type === 'ACCIDENT' && (unit.type === 'AMBULANCE' || unit.type === 'FIRE_ENGINE')) score += 15;

      const finalScore = Math.min(99, Math.max(35, Math.round(score)));

      return {
        unitId: unit.id,
        unit,
        score: finalScore,
        distanceKm,
        etaMinutes,
        matchedCapabilities: matchedCapabilities.length ? matchedCapabilities : [unit.capabilities[0]],
        missingCapabilities,
        reasoning: `${unit.callsign} is ${distanceKm} km away (ETA ${etaMinutes} mins) with ${matchedCapabilities.length ? matchedCapabilities.join(', ') : 'standard emergency'} capabilities.`
      };
    })
    .sort((a, b) => b.score - a.score);
}
