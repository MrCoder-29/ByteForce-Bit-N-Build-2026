import React, { useState, useEffect } from 'react';
import { Incident, ResourceUnit, DispatchRecommendation } from '../../types/emergency';
import { emergencyApi } from '../../services/api';
import { X, Navigation, CheckCircle2, AlertTriangle, Shield, Clock, Fuel, Radio, Sparkles, Send, Check } from 'lucide-react';

interface DispatchModalProps {
  incident: Incident | null;
  units: ResourceUnit[];
  onClose: () => void;
  onDispatchSuccess: (incidentId: string, unitId: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  incident,
  units,
  onClose,
  onDispatchSuccess,
}) => {
  const [recommendations, setRecommendations] = useState<DispatchRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmUnit, setConfirmUnit] = useState<DispatchRecommendation | null>(null);
  const [dispatchingUnitId, setDispatchingUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (!incident) return;

    setLoading(true);
    emergencyApi
      .getDispatchRecommendations(incident.id)
      .then((data) => {
        setRecommendations(data);
      })
      .catch((err) => {
        console.error('Failed to load dispatch recommendations', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [incident, units]);

  if (!incident) return null;

  const handleConfirmDeploy = async () => {
    if (!confirmUnit) return;

    setDispatchingUnitId(confirmUnit.unitId);
    try {
      const res = await emergencyApi.dispatchUnit({
        incidentId: incident.id,
        unitId: confirmUnit.unitId,
        dispatchNotes: `Automated dispatch of ${confirmUnit.unit.callsign} via Command HQ (ETA ${confirmUnit.etaMinutes} mins)`,
      });

      if (res.success) {
        onDispatchSuccess(incident.id, confirmUnit.unitId);
        onClose();
      }
    } catch (err) {
      alert('Dispatch failed: ' + (err as Error).message);
    } finally {
      setDispatchingUnitId(null);
      setConfirmUnit(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1322] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#0b0f19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-white">INTELLIGENT UNIT DISPATCH</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                  AI RECOMMENDATION ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">Target Incident: <strong className="text-slate-200">{incident.id} - {incident.title}</strong></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Confirmation Overlay step */}
          {confirmUnit ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-red-950/40 border border-red-500/50 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <div>
                <h4 className="font-heading font-extrabold text-base text-white">Confirm Deployment Action</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Are you sure you want to deploy <strong className="text-cyan-400">{confirmUnit.unit.callsign}</strong> to <strong className="text-white">{incident.title}</strong>?
                </p>
                <div className="mt-2 text-xs text-slate-400 font-mono">
                  Distance: {confirmUnit.distanceKm} km | Estimated ETA: {confirmUnit.etaMinutes} mins
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  disabled={dispatchingUnitId === confirmUnit.unitId}
                  onClick={handleConfirmDeploy}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all"
                >
                  {dispatchingUnitId === confirmUnit.unitId ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{dispatchingUnitId === confirmUnit.unitId ? 'Deploying...' : 'CONFIRM DISPATCH NOW'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Incident Requirements Banner */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Required Capabilities:</span>
                  <div className="flex flex-wrap gap-1">
                    {incident.requiredCapabilities.map((req, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-1">Target Location:</span>
                  <span className="font-semibold text-slate-200">{incident.location.cityZone}</span>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Ranked Recommended Response Units
                </label>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Computing spatial distances and matching unit capabilities...</span>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-900 rounded-xl border border-slate-800">
                    No available response units match the criteria. Check off-duty or dispatched units.
                  </div>
                ) : (
                  recommendations.map((rec, index) => {
                    const isFirst = index === 0;
                    return (
                      <div
                        key={rec.unitId}
                        className={`p-4 rounded-xl border transition-all ${
                          isFirst
                            ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left Unit Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-base text-white">{rec.unit.callsign}</span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {rec.unit.type.replace('_', ' ')}
                              </span>
                              {isFirst && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-1 shadow-sm">
                                  <Sparkles className="w-3 h-3" /> TOP AI MATCH
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-300">
                              <span className="flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                                <strong>{rec.distanceKm} km</strong> away
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                ETA <strong>{rec.etaMinutes} mins</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                                Fuel <strong>{rec.unit.batteryOrFuelPercent}%</strong>
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 leading-normal">{rec.reasoning}</p>

                            {/* Capability Badges */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {rec.matchedCapabilities.map((cap, i) => (
                                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                                  ✓ {cap}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Right AI Score & Deploy Action */}
                          <div className="flex flex-col items-end justify-between shrink-0 h-full space-y-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Match Score</span>
                              <span className="font-heading font-extrabold text-2xl text-cyan-400">{rec.score}%</span>
                            </div>

                            <button
                              onClick={() => setConfirmUnit(rec)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Deploy Unit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
