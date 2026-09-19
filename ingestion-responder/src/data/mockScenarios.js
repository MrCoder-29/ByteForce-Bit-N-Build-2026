// Deterministic Hackathon Scenarios matching PS-9 Specifications
export const DEMO_SCENARIOS = {
  chemical_fire: {
    id: 'SCENARIO_A',
    name: '5-Alarm Industrial Chemical Fire',
    category: 'HAZMAT / Fire',
    severity: 'CRITICAL',
    badgeColor: 'bg-red-500',
    description: 'Multiple explosions reported at Apex Petrochemical Storage Facility, Sector 4. Toxic vapor plume forming.',
    location: {
      address: 'Apex Petrochem Complex, Dock 14, Industrial Zone',
      coordinates: [40.7128, -74.0060],
      area: 'Industrial District'
    },
    // Multi-source events generated when this scenario triggers
    events: [
      {
        source: '911_CALL_AUDIO',
        title: '911 Emergency Dispatch Audio Call',
        reporter: 'Plant Security Gatehouse',
        phone: '+1-555-019-4821',
        description: 'Plant security calling 911! Major tank rupture at Storage Tank 7. Volatile solvent caught fire. Heavy black smoke and sulfur smell. Workers evacuating towards East Gate.',
        transcript: "911 What's your emergency? — Security guard here, Tank 7 blew up! Fire is spreading toward the chlorine tanks! We need fire and hazmat immediately!",
        severity: 5,
        location: { lat: 40.7128, lng: -74.0060, address: 'Dock 14, Apex Petrochem' }
      },
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #1 (Nearby Driver)',
        reporter: 'Marcus Vance',
        phone: '+1-555-012-9988',
        description: 'Driving down River Road, just saw massive fireball and black cloud from chemical factory. Hard to breathe with windows down.',
        severity: 4,
        location: { lat: 40.7134, lng: -74.0055, address: 'River Road (200m from Apex)' }
      },
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #2 (Warehouse Worker)',
        reporter: 'Sarah Lin',
        phone: '+1-555-018-3312',
        description: 'Loud explosion next door at Petrochem. Alarms sounding across the entire park. Smells like rotten eggs.',
        severity: 5,
        location: { lat: 40.7122, lng: -74.0068, address: 'Adjacent Logistics Hub B' }
      },
      {
        source: 'IOT_SENSOR',
        title: 'IoT Gas Sensor Spike (SNS-GAS-04)',
        sensorId: 'SNS-GAS-04',
        sensorType: 'Volatile Organic Compound / Ammonia Detector',
        metric: 'Toxic Gas Concentration',
        value: '480 PPM',
        threshold: '50 PPM',
        status: 'CRITICAL_THRESHOLD_EXCEEDED',
        severity: 5,
        location: { lat: 40.7125, lng: -74.0062, address: 'Industrial Zone Sensor Mast #4' }
      }
    ],
    recommendedResources: [
      { unitId: 'HAZMAT-1', name: 'Hazmat Response Unit 1', type: 'HAZMAT Heavy', eta: '3 mins', distance: '1.2 km' },
      { unitId: 'ENGINE-7', name: 'Fire Engine 7 (Foam Capable)', type: 'Industrial Fire', eta: '4 mins', distance: '1.8 km' },
      { unitId: 'MEDIC-4', name: 'Trauma ALS Medic 4', type: 'Advanced Life Support', eta: '5 mins', distance: '2.4 km' }
    ],
    tacticalSop: [
      { id: 1, text: 'Establish 500m Hot Zone perimeter; evacuate downwind areas', completed: false },
      { id: 2, text: 'Mandatory Level-B SCBA Hazmat protective gear for all entry teams', completed: false },
      { id: 3, text: 'Deploy Class-B aqueous film-forming foam (AFFF) suppression', completed: false },
      { id: 4, text: 'Activate municipal water spray curtains to dilute vapor plume', completed: false },
      { id: 5, text: 'Alert regional burn trauma center (Mercy General Hospital)', completed: false }
    ]
  },

  flash_flood: {
    id: 'SCENARIO_B',
    name: 'Flash Flood Sensor Alert & Stranded Motorists',
    category: 'Natural Disaster / Flood',
    severity: 'HIGH',
    badgeColor: 'bg-blue-500',
    description: 'Rapid water level rise at Blackwood Creek culvert. Multiple vehicles trapped under railway viaduct.',
    location: {
      address: 'Blackwood Creek Crossing at 5th St Viaduct',
      coordinates: [40.7305, -73.9925],
      area: 'Lowland Metro Basin'
    },
    events: [
      {
        source: 'IOT_SENSOR',
        title: 'IoT Hydro-Acoustic Water Sensor (SNS-FLD-01)',
        sensorId: 'SNS-FLD-01',
        sensorType: 'Ultrasonic Culvert Water Level Gauge',
        metric: 'Water Height Above Roadway',
        value: '4.2 Meters',
        threshold: '2.0 Meters',
        status: 'RAPID_FLASH_SURGE',
        severity: 4,
        location: { lat: 40.7305, lng: -73.9925, address: '5th Street Underpass Culvert' }
      },
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #1 (Stranded Driver)',
        reporter: 'David K.',
        phone: '+1-555-014-7744',
        description: 'Water rose to hood level in 3 minutes under the bridge! 2 cars stuck with elderly driver inside one.',
        severity: 4,
        location: { lat: 40.7308, lng: -73.9920, address: '5th St Viaduct Entrance' }
      },
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #2 (Pedestrian)',
        reporter: 'Elena Rostova',
        phone: '+1-555-019-1120',
        description: 'Torrential current sweeping debris across road. People standing on car roofs waiting for help.',
        severity: 4,
        location: { lat: 40.7302, lng: -73.9930, address: '5th & Elm Pedestrian Walk' }
      }
    ],
    recommendedResources: [
      { unitId: 'BOAT-2', name: 'Swift Water Rescue Boat 2', type: 'Amphibious Zodiac', eta: '5 mins', distance: '2.1 km' },
      { unitId: 'RESCUE-3', name: 'Heavy Rescue Squad 3', type: 'Winch & Rigging', eta: '6 mins', distance: '2.9 km' },
      { unitId: 'POLICE-12', name: 'Metro Traffic Patrol 12', type: 'Road Closure', eta: '2 mins', distance: '0.8 km' }
    ],
    tacticalSop: [
      { id: 1, text: 'Close roadway access points 400m upstream and downstream', completed: false },
      { id: 2, text: 'Deploy tethered inflatable swift-water rescue craft', completed: false },
      { id: 3, text: 'Extract vehicle occupants using personal flotation devices', completed: false },
      { id: 4, text: 'De-energize low-voltage submerged municipal power poles', completed: false }
    ]
  },

  highway_collision: {
    id: 'SCENARIO_C',
    name: 'Road Collision on Highway (Multi-Vehicle Pileup)',
    category: 'Transportation / Medical',
    severity: 'HIGH',
    badgeColor: 'bg-amber-500',
    description: '3 passenger vehicles and tanker truck collision on Interstate I-95 Northbound. 2 entrapped victims with severe injuries.',
    location: {
      address: 'Interstate Highway 95 North, Mile Marker 42.5',
      coordinates: [40.7450, -73.9800],
      area: 'Highway Corridor'
    },
    events: [
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #1 (Passing Motorist)',
        reporter: 'Jason Reed',
        phone: '+1-555-016-6632',
        description: 'Horrible pileup right before Exit 8! Tanker jackknifed across two lanes, SUV crushed underneath. People trapped inside.',
        severity: 5,
        location: { lat: 40.7450, lng: -73.9800, address: 'I-95 North Mile 42' }
      },
      {
        source: 'CITIZEN_REPORT',
        title: 'Citizen Report #2 (Truck Driver)',
        reporter: 'Bill Thornton',
        phone: '+1-555-017-4491',
        description: 'Fuel leaking onto pavement from ruptured saddle tank. Need fire crew with hydraulic cutters immediately.',
        severity: 4,
        location: { lat: 40.7455, lng: -73.9795, address: 'I-95 North Mile 42.5' }
      }
    ],
    recommendedResources: [
      { unitId: 'RESCUE-1', name: 'Heavy Rescue 1 (Jaws of Life)', type: 'Hydraulic Extrication', eta: '4 mins', distance: '1.9 km' },
      { unitId: 'MEDIC-2', name: 'Trauma ALS Medic 2', type: 'Critical Care Ambulance', eta: '5 mins', distance: '2.5 km' },
      { unitId: 'ENGINE-3', name: 'Engine 3 (Hazardous Wash)', type: 'Fuel Wash / Foam', eta: '6 mins', distance: '3.1 km' }
    ],
    tacticalSop: [
      { id: 1, text: 'Deploy state troopers to block all northbound highway lanes', completed: false },
      { id: 2, text: 'Apply dry chemical absorbent on 50-gallon diesel fuel spill', completed: false },
      { id: 3, text: 'Execute hydraulic roof flap extrication on trapped passenger vehicle', completed: false },
      { id: 4, text: 'Establish Medevac landing zone on clear southbound shoulder', completed: false }
    ]
  }
};

// Simulated Sensors across the metro grid
export const SIMULATED_SENSORS = [
  {
    id: 'SNS-GAS-04',
    name: 'Chemical District Gas Vapor Analyzer',
    type: 'HAZMAT VOC / Ammonia Sensor',
    location: 'Sector 4 Industrial Park',
    coordinates: [40.7125, -74.0062],
    metricName: 'Concentration (PPM)',
    normalValue: 12,
    dangerValue: 480,
    unit: 'PPM',
    status: 'NORMAL',
    currentValue: 12
  },
  {
    id: 'SNS-FLD-01',
    name: 'Blackwood Basin Culvert Hydro Gauge',
    type: 'Ultrasonic Flood Sensor',
    location: '5th Street Underpass',
    coordinates: [40.7305, -73.9925],
    metricName: 'Water Depth',
    normalValue: 0.4,
    dangerValue: 4.2,
    unit: 'Meters',
    status: 'NORMAL',
    currentValue: 0.4
  },
  {
    id: 'SNS-FIR-09',
    name: 'Port Logistics Thermal Infrared Sensor',
    type: 'Infrared Thermal & PM2.5',
    location: 'Warehouse District Pier 9',
    coordinates: [40.7080, -74.0150],
    metricName: 'Thermal Signature',
    normalValue: 24,
    dangerValue: 310,
    unit: '°C',
    status: 'NORMAL',
    currentValue: 24
  },
  {
    id: 'SNS-SEIS-02',
    name: 'Metro Viaduct Structural Vibration Monitor',
    type: 'Acoustic Accelerometer',
    location: 'Central Elevated Rail Pier',
    coordinates: [40.7500, -73.9850],
    metricName: 'Peak Acceleration',
    normalValue: 0.02,
    dangerValue: 0.78,
    unit: 'g',
    status: 'NORMAL',
    currentValue: 0.02
  }
];

// Initial field responder dispatch profile
export const INITIAL_RESPONDER_PROFILE = {
  unitId: 'ENGINE-7',
  unitName: 'Engine 7 Fire & Hazmat Crew',
  responderName: 'Capt. T. Miller',
  agency: 'Metro Fire & Rescue Dept',
  status: 'AVAILABLE', // AVAILABLE, DISPATCHED, EN_ROUTE, ON_SCENE, RESOLVED
  currentCoordinates: [40.7180, -74.0010],
  vehicleType: 'Heavy Foam Pumper & Rescue Truck',
  capabilities: ['Class-B Foam', 'SCBA Level-B', 'Thermal Imaging', 'Jaws of Life']
};
