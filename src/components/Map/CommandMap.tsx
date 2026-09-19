import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, ResourceUnit } from '../../types/emergency';
import { ShieldAlert, Eye, Navigation, Maximize2, Target, Layers } from 'lucide-react';

interface CommandMapProps {
  incidents: Incident[];
  units: ResourceUnit[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onOpenDispatchModal: (inc: Incident) => void;
}

// Generate Accessible Leaflet Custom Icon (Icon + Color + Text Severity Badge)
const createIncidentIcon = (severity: Incident['severity'], isSelected: boolean) => {
  let color = '#ef4444'; // CRITICAL
  let labelText = 'CRITICAL';
  if (severity === 'HIGH') { color = '#f97316'; labelText = 'HIGH'; }
  if (severity === 'MEDIUM') { color = '#eab308'; labelText = 'MED'; }
  if (severity === 'LOW') { color = '#3b82f6'; labelText = 'LOW'; }

  const size = isSelected ? 52 : 44;

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="position: absolute; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: pulseRing 1.8s infinite;"></div>
      <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: #0d1322; border: 3px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <span style="font-size: 11px; font-weight: 800; background: ${color}; color: #ffffff; padding: 2px 7px; border-radius: 4px; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.6);">
        ${labelText}
      </span>
    </div>
  `;

  return L.divIcon({ html, className: '', iconSize: [size, size + 20], iconAnchor: [size / 2, size / 2] });
};

// Generate Leaflet SVG Custom Icon for Responders
const createUnitIcon = (status: ResourceUnit['status']) => {
  let color = '#10b981'; // AVAILABLE
  let labelText = 'READY';
  if (status === 'DISPATCHED') { color = '#f59e0b'; labelText = 'DISPATCHED'; }
  if (status === 'EN_ROUTE') { color = '#06b6d4'; labelText = 'EN ROUTE'; }
  if (status === 'ON_SCENE') { color = '#a855f7'; labelText = 'ON SCENE'; }
  if (status === 'OFFLINE') { color = '#6b7280'; labelText = 'OFFLINE'; }

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #0d1322; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
      <span style="font-size: 10px; font-weight: 800; background: #0f172a; color: ${color}; border: 1.5px solid ${color}; padding: 1.5px 5px; border-radius: 4px; margin-top: 3px;">
        ${labelText}
      </span>
    </div>
  `;

  return L.divIcon({ html, className: '', iconSize: [36, 50], iconAnchor: [18, 18] });
};

// Helper component to center map on selected incident or fit bounds
const MapViewAdjuster: React.FC<{ selectedIncident: Incident | null; incidents: Incident[] }> = ({
  selectedIncident,
  incidents,
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (selectedIncident) {
      map.setView([selectedIncident.location.lat, selectedIncident.location.lng], 14, { animate: true });
    }
  }, [selectedIncident, map]);

  return null;
};

export const CommandMap: React.FC<CommandMapProps> = ({
  incidents,
  units,
  selectedIncident,
  onSelectIncident,
  onOpenDispatchModal,
}) => {
  const [showIncidents, setShowIncidents] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Default Center: Mumbai Metropolitan Region
  const mapCenter: [number, number] = [19.0760, 72.8777];

  // Route Polyline
  let routePolyline: [number, number][] | null = null;
  if (selectedIncident && showRoutes) {
    let targetUnit: ResourceUnit | undefined;
    if (selectedIncident.assignedUnitId) {
      targetUnit = units.find((u) => u.id === selectedIncident.assignedUnitId);
    } else {
      targetUnit = units.find((u) => u.status === 'AVAILABLE');
    }

    if (targetUnit) {
      routePolyline = [
        [selectedIncident.location.lat, selectedIncident.location.lng],
        [targetUnit.location.lat, targetUnit.location.lng],
      ];
    }
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b0f19]">
      {/* Top Map Control Actions Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            if (selectedIncident) {
              // Map view adjuster will fly
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-750 text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 shadow-xl transition-all hover:bg-slate-800"
        >
          <Target className="w-4 h-4 text-red-400" />
          <span>Locate Selected</span>
        </button>
      </div>

      {/* Right Layer Controls */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2.5 select-none min-w-[200px]">
        <span className="font-heading font-extrabold text-slate-200 tracking-wider text-xs uppercase block border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" /> Map Layers
        </span>

        <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white text-xs sm:text-sm font-semibold">
          <input
            type="checkbox"
            checked={showIncidents}
            onChange={(e) => setShowIncidents(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-red-500"
          />
          <span>Incidents ({incidents.length})</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white text-xs sm:text-sm font-semibold">
          <input
            type="checkbox"
            checked={showUnits}
            onChange={(e) => setShowUnits(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <span>Response Units ({units.length})</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white text-xs sm:text-sm font-semibold">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
          />
          <span>Density Hotspots</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white text-xs sm:text-sm font-semibold">
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={(e) => setShowRoutes(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <span>Dispatch Routes</span>
        </label>
      </div>

      {/* Accessible Severity Legend Badge */}
      <div className="absolute bottom-5 left-5 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2 hidden sm:block">
        <div className="font-heading font-extrabold text-slate-300 uppercase tracking-wider text-xs">Severity Legend (Accessible)</div>
        <div className="flex items-center gap-4 text-xs font-black tracking-wide">
          <span className="flex items-center gap-1.5 text-red-400">🔴 CRITICAL</span>
          <span className="flex items-center gap-1.5 text-orange-400">🟠 HIGH</span>
          <span className="flex items-center gap-1.5 text-yellow-400">🟡 MEDIUM</span>
          <span className="flex items-center gap-1.5 text-blue-400">🔵 LOW</span>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapViewAdjuster selectedIncident={selectedIncident} incidents={incidents} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap/Density Circles */}
        {showHeatmap &&
          incidents.map((inc) => (
            <CircleMarker
              key={`heat-${inc.id}`}
              center={[inc.location.lat, inc.location.lng]}
              radius={inc.severity === 'CRITICAL' ? 45 : inc.severity === 'HIGH' ? 30 : 20}
              pathOptions={{
                fillColor: inc.severity === 'CRITICAL' ? '#ef4444' : inc.severity === 'HIGH' ? '#f97316' : '#eab308',
                fillOpacity: 0.15,
                stroke: false,
              }}
            />
          ))}

        {/* Dispatch Route Polyline */}
        {routePolyline && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#06b6d4',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />
        )}

        {/* Incident Markers */}
        {showIncidents &&
          incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <Marker
                key={inc.id}
                position={[inc.location.lat, inc.location.lng]}
                icon={createIncidentIcon(inc.severity, isSelected)}
                eventHandlers={{
                  click: () => onSelectIncident(inc),
                }}
              >
                <Popup>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl min-w-[240px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        inc.severity === 'CRITICAL' ? 'bg-red-950/80 text-red-400 border-red-500/40' :
                        inc.severity === 'HIGH' ? 'bg-orange-950/80 text-orange-400 border-orange-500/40' :
                        'bg-yellow-950/80 text-yellow-400 border-yellow-500/40'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{inc.id}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-white mb-1 line-clamp-1">{inc.title}</h4>
                    <p className="text-xs text-slate-300 mb-2 line-clamp-2">{inc.location.address}</p>

                    <div className="text-[11px] text-slate-400 mb-3 bg-slate-950 p-2 rounded border border-slate-800">
                      <strong className="text-red-400">AI Summary:</strong> {inc.aiSummary}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => onSelectIncident(inc)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Triage Info</span>
                      </button>

                      <button
                        onClick={() => onOpenDispatchModal(inc)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-red-950 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Responder Markers */}
        {showUnits &&
          units.map((unit) => (
            <Marker
              key={unit.id}
              position={[unit.location.lat, unit.location.lng]}
              icon={createUnitIcon(unit.status)}
            >
              <Popup>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-heading font-bold text-xs text-emerald-400">{unit.callsign}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">
                      {unit.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1"><strong>Type:</strong> {unit.type.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-300 mb-1"><strong>Location:</strong> {unit.location.address}</p>
                  <p className="text-xs text-slate-300"><strong>Fuel/Battery:</strong> {unit.batteryOrFuelPercent}%</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
