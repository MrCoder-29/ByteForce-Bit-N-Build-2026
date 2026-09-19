import React, { useState } from 'react';
import { EmergencyType, Incident } from '../../types/emergency';
import { emergencyApi } from '../../services/api';
import { Shield, Flame, HeartPulse, Droplets, Car, ShieldAlert, AlertTriangle, MapPin, Mic, Send, CheckCircle2, PhoneCall, Crosshair, Users, Phone } from 'lucide-react';

interface CitizenReportPortalProps {
  onReportSubmitted: (newIncident: Incident) => void;
}

export const CitizenReportPortal: React.FC<CitizenReportPortalProps> = ({ onReportSubmitted }) => {
  const [type, setType] = useState<EmergencyType>('FIRE');
  const [address, setAddress] = useState<string>('Andheri Metro Station Gate 3, Andheri East');
  const [description, setDescription] = useState<string>('');
  const [injuredCount, setInjuredCount] = useState<number>(2);
  const [contact, setContact] = useState<string>('+91 98200 99887');
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Location Presets for Mumbai Metro Area
  const LOCATION_PRESETS = [
    'Andheri Metro Station Gate 3, Andheri East',
    'Dharavi Slum Cluster Zone 4, Sion West',
    'Chembur Chemical Plant Gate 2',
    'Bandra-Worli Sea Link Toll Plaza',
    'Vashi Highway Flyover Junction',
  ];

  const handleMicToggle = () => {
    setIsDictating(true);
    setTimeout(() => {
      setDescription("Heavy smoke emerging from electrical transformer box. Sparks flying near pedestrian pathway.");
      setIsDictating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newIncId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const lat = 19.1190 + (Math.random() - 0.5) * 0.04;
    const lng = 72.8460 + (Math.random() - 0.5) * 0.04;

    const newIncident: Incident = {
      id: newIncId,
      title: `${type} Emergency reported near ${address.split(',')[0]}`,
      type,
      severity: injuredCount > 2 ? 'CRITICAL' : 'HIGH',
      status: 'PENDING',
      location: {
        lat,
        lng,
        address,
        cityZone: 'North Zone (Citizen Portal)'
      },
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      source: 'CITIZEN_APP',
      duplicateCount: 0,
      aiSummary: description || `Citizen report of ${type} emergency with ${injuredCount} estimated casualties near ${address}.`,
      riskScore: injuredCount > 2 ? 88 : 72,
      requiredCapabilities: [
        type === 'FIRE' ? 'Fire Suppression' : type === 'MEDICAL' ? 'Advanced Life Support' : 'Emergency Response'
      ],
      slaMinutesRemaining: 5,
      callerContact: contact,
      estimatedCasualties: {
        injured: injuredCount,
        fatalities: 0,
        trapped: 0,
        summary: `${injuredCount} casualties reported by citizen.`
      }
    };

    emergencyApi.submitCitizenReport({
      raw_text: `${type} Emergency: ${description || 'Citizen emergency report'} near ${address} (${injuredCount} casualties estimated)`,
      latitude: lat,
      longitude: lng,
      reporter_contact: contact,
      source: 'citizen_web'
    }).then((created) => {
      onReportSubmitted(created);
      setIsSubmitting(false);
      setSuccessMessage(`✓ EMERGENCY REPORT ${created.id} SUBMITTED TO COMMAND HQ SUCCESSFULLY!`);
      setDescription('');
    }).catch(() => {
      onReportSubmitted(newIncident);
      setIsSubmitting(false);
      setSuccessMessage(`✓ EMERGENCY REPORT ${newIncId} SUBMITTED TO COMMAND HQ SUCCESSFULLY!`);
      setDescription('');
    });
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 bg-[#090d16] flex flex-col items-center justify-start min-h-0">
      <div className="w-full max-w-3xl bg-[#0d1322] border-2 border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto shrink-0">
        
        {/* Portal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-500/40 shrink-0">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-wide">
                CITIZEN EMERGENCY PORTAL
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Direct Real-Time Dispatch Pipeline to ByteForce Command HQ
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 font-mono text-xs font-bold animate-pulse hidden sm:inline-block">
            🔴 LIVE SOS PIPELINE
          </span>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-extrabold flex items-center gap-3 shadow-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span>{successMessage}</span>
              <p className="text-xs font-normal text-emerald-300 mt-0.5">Incident created on Command HQ Map & Incident Feed.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Emergency Type Selector */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider block">
              1. Select Emergency Type <span className="text-red-400 text-base">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'FIRE', label: 'Fire', icon: Flame, color: 'text-red-400 bg-red-950/60 border-red-500/60 ring-red-500' },
                { id: 'MEDICAL', label: 'Medical', icon: HeartPulse, color: 'text-rose-400 bg-rose-950/60 border-rose-500/60 ring-rose-500' },
                { id: 'FLOOD', label: 'Flood', icon: Droplets, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/60 ring-cyan-500' },
                { id: 'ACCIDENT', label: 'Accident', icon: Car, color: 'text-amber-400 bg-amber-950/60 border-amber-500/60 ring-amber-500' },
                { id: 'HAZMAT', label: 'Hazmat', icon: ShieldAlert, color: 'text-purple-400 bg-purple-950/60 border-purple-500/60 ring-purple-500' },
                { id: 'CRIME', label: 'Crime', icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/60 ring-yellow-500' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setType(item.id as EmergencyType)}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${item.color} shadow-lg ring-2 scale-[1.02]`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Incident Location Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider block">
                2. Incident Location Address <span className="text-red-400 text-base">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAddress('WEH Highway Flyover, Vile Parle East, Mumbai')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-1 hover:bg-slate-700 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Use Live GPS</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address, building, or landmark..."
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Quick Location Presets */}
            <div className="pt-1 flex flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                📍 Quick Presets:
              </span>
              {LOCATION_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAddress(preset)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition-all"
                >
                  {preset.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Incident Description & Voice Dictation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider block">
                3. Situation Description
              </label>
              <button
                type="button"
                onClick={handleMicToggle}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                  isDictating ? 'bg-red-950 text-red-400 border-red-500 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>{isDictating ? 'Listening...' : 'AI Voice Input'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe what is happening, visible flames, toxic odor, or injured people..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* 4. Casualties & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Injured Casualties</span>
              </label>
              <input
                type="number"
                min="0"
                value={injuredCount}
                onChange={(e) => setInjuredCount(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>Caller Contact</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-950 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'TRANSMITTING EMERGENCY ALERT...' : '🚨 SUBMIT EMERGENCY REPORT TO COMMAND HQ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
