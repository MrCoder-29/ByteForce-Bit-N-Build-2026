import React, { useState } from 'react';
import { Incident, EmergencyType, SeverityLevel } from '../../types/emergency';
import { X, PlusCircle, CheckCircle2, MapPin, Flame, HeartPulse, Droplets, Car, ShieldAlert, Crosshair } from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIncident: (newIncident: Incident) => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onCreateIncident,
}) => {
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('FIRE');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [lat, setLat] = useState<string>('19.0760');
  const [lng, setLng] = useState<string>('72.8777');
  const [estimatedCasualties, setEstimatedCasualties] = useState<number>(0);
  const [source, setSource] = useState<Incident['source']>('CITIZEN_APP');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset location map coordinates selector for Mumbai Metro Region SIH Demo
  const PRESET_LOCATIONS = [
    { label: 'Dharavi Slum Cluster Zone 4', lat: '19.0434', lng: '72.8526' },
    { label: 'Andheri Metro Line 3 Construction Site', lat: '19.1190', lng: '72.8460' },
    { label: 'Chembur Industrial Chemical Complex', lat: '19.0620', lng: '72.8990' },
    { label: 'Bandra-Worli Sea Link Toll Gate', lat: '19.0330', lng: '72.8160' },
    { label: 'Vashi Creek Bridge Railway Line', lat: '19.0640', lng: '72.9970' },
  ];

  const handleSelectPresetLocation = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocationAddress(preset.label);
    setLat(preset.lat);
    setLng(preset.lng);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!emergencyType) newErrors.emergencyType = 'Emergency type is required';
    if (!title.trim()) newErrors.title = 'Incident title is required';
    if (!locationAddress.trim()) newErrors.locationAddress = 'Location address is required';
    if (!severity) newErrors.severity = 'Severity level is required';

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      newErrors.lat = 'Valid latitude (-90 to 90) is required';
    }
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      newErrors.lng = 'Valid longitude (-180 to 180) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const testId = `INC-2026-TEST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: Incident = {
      id: testId,
      title: title.trim(),
      type: emergencyType,
      severity,
      status: 'PENDING',
      location: {
        lat: parseFloat(lat) || 19.0760,
        lng: parseFloat(lng) || 72.8777,
        address: locationAddress.trim(),
        cityZone: 'Central Zone (Manual Override)'
      },
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      source,
      duplicateCount: 0,
      duplicates: [],
      aiSummary: description.trim() || `TEST/SIMULATION: ${title.trim()} reported via ${source}. Manual incident entry by Command HQ dispatcher.`,
      riskScore: severity === 'CRITICAL' ? 95 : severity === 'HIGH' ? 80 : severity === 'MEDIUM' ? 55 : 30,
      requiredCapabilities:
        emergencyType === 'FIRE'
          ? ['FIRE_SUPPRESSION', 'SEARCH_RESCUE']
          : emergencyType === 'MEDICAL'
          ? ['ADVANCED_LIFE_SUPPORT', 'PATIENT_TRANSPORT']
          : emergencyType === 'HAZMAT'
          ? ['HAZMAT_CONTAINMENT', 'DECONTAMINATION']
          : ['RAPID_RESPONSE', 'TRAFFIC_CONTROL'],
      slaMinutesRemaining: severity === 'CRITICAL' ? 8 : severity === 'HIGH' ? 15 : 30,
      callerContact: '+91 98765 00000',
      notes: [`Manual test incident created on ${new Date().toLocaleString()} by Command HQ operator.`],
      estimatedCasualties: {
        injured: Number(estimatedCasualties) || 0,
        fatalities: 0,
        trapped: 0,
        summary: `${estimatedCasualties || 0} casualties reported in manual entry.`
      },
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
          label: 'Manual Test Incident Created',
          details: 'Operator created manual test incident in Command HQ',
          type: 'CALL'
        }
      ]
    };

    setSuccessMessage(`✓ Test incident ${testId} created successfully`);

    setTimeout(() => {
      onCreateIncident(newIncident);
      setSuccessMessage(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-500/30">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-white tracking-wide">
                CREATE NEW INCIDENT
              </h2>
              <p className="text-xs text-slate-400 font-mono">Manual Command HQ Incident Entry (Test / Simulation)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Emergency Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Emergency Type <span className="text-red-400">*</span>
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="FIRE">🔥 Fire</option>
              <option value="FLOOD">🌊 Flood</option>
              <option value="ACCIDENT">🚗 Road Accident</option>
              <option value="HAZMAT">☣️ Industrial Accident (Hazmat)</option>
              <option value="MEDICAL">🚑 Medical Emergency</option>
              <option value="STRUCTURAL">🏗️ Structural Collapse</option>
              <option value="CRIME">🛡️ Other (Crime / Public Safety)</option>
            </select>
            {errors.emergencyType && <p className="text-[11px] text-red-400">{errors.emergencyType}</p>}
          </div>

          {/* 2. Incident Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Major Transformer Fire near Metro Pillar 42"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-slate-900 border ${errors.title ? 'border-red-500' : 'border-slate-800'} rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500`}
            />
            {errors.title && <p className="text-[11px] text-red-400">{errors.title}</p>}
          </div>

          {/* 3. Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Description (AI Triage Summary)
            </label>
            <textarea
              rows={2}
              placeholder="Enter details regarding casualties, hazard scale, or immediate support required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 4. Severity & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                4. Severity Level <span className="text-red-400">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="CRITICAL">🔴 CRITICAL (Immediate Life Threat)</option>
                <option value="HIGH">🟠 HIGH (Major Hazard / Escalating)</option>
                <option value="MEDIUM">🟡 MEDIUM (Standard Response)</option>
                <option value="LOW">🔵 LOW (Minor Incident)</option>
              </select>
              {errors.severity && <p className="text-[11px] text-red-400">{errors.severity}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                5. Source Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Incident['source'])}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="CITIZEN_APP">📱 Citizen Report (PWA)</option>
                <option value="911_HOTLINE">📞 Emergency Call (Hotline)</option>
                <option value="IOT_SENSOR">📡 Sensor / IoT Alert</option>
                <option value="DRONE_FEED">🚁 Field Team / Drone Feed</option>
                <option value="SOCIAL_MEDIA">🌐 Social Media Detection</option>
              </select>
            </div>
          </div>

          {/* 5. Location Address & Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                6. Location Address <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">📍 Select Preset below</span>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder="e.g. Metro Line 3 Station, Andheri East"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-900 border ${errors.locationAddress ? 'border-red-500' : 'border-slate-800'} rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500`}
              />
            </div>
            {errors.locationAddress && <p className="text-[11px] text-red-400">{errors.locationAddress}</p>}

            {/* Location Presets for Quick Map Positioning */}
            <div className="pt-1">
              <p className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-amber-400" />
                <span>Quick Location & Map Coordinates:</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleSelectPresetLocation(preset)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition-all text-left"
                  >
                    📍 {preset.label.split(' ')[0]} {preset.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Coordinates & Estimated Casualties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              {errors.lat && <p className="text-[10px] text-red-400">{errors.lat}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              {errors.lng && <p className="text-[10px] text-red-400">{errors.lng}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Casualties</label>
              <input
                type="number"
                min="0"
                value={estimatedCasualties}
                onChange={(e) => setEstimatedCasualties(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
