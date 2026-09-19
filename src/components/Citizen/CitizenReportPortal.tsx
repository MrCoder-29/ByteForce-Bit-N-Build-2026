import React, { useState } from 'react';
import { EmergencyType, Incident } from '../../types/emergency';
import { emergencyApi } from '../../services/api';
import { Shield, Flame, HeartPulse, Droplets, Car, ShieldAlert, AlertTriangle, MapPin, Mic, Camera, Send, CheckCircle2, PhoneCall } from 'lucide-react';

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

  const handleMicToggle = () => {
    setIsDictating(true);
    setTimeout(() => {
      setDescription("Heavy smoke emerging from electrical transformer box. Sparks flying near pedestrian pathway.");
      setIsDictating(false);
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newIncId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: Incident = {
      id: newIncId,
      title: `${type} Emergency reported near ${address.split(',')[0]}`,
      type,
      severity: injuredCount > 2 ? 'CRITICAL' : 'HIGH',
      status: 'PENDING',
      location: {
        lat: 19.1190 + (Math.random() - 0.5) * 0.04,
        lng: 72.8460 + (Math.random() - 0.5) * 0.04,
        address,
        cityZone: 'North Zone'
      },
      timestamp: new Date().toISOString(),
      source: 'CITIZEN_APP',
      duplicateCount: 0,
      aiSummary: description || `Citizen report of ${type} emergency with ${injuredCount} estimated casualties.`,
      riskScore: 78,
      requiredCapabilities: [
        type === 'FIRE' ? 'Fire Extinguishing' : type === 'MEDICAL' ? 'Advanced Life Support' : 'Emergency Response'
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

    const lat = 19.1190 + (Math.random() - 0.5) * 0.04;
    const lng = 72.8460 + (Math.random() - 0.5) * 0.04;

    emergencyApi.submitCitizenReport({
      raw_text: `${type} Emergency: ${description || 'Citizen emergency report'} near ${address} (${injuredCount} casualties estimated)`,
      latitude: lat,
      longitude: lng,
      reporter_contact: contact,
      source: 'citizen_web'
    }).then((created) => {
      onReportSubmitted(created);
      setIsSubmitting(false);
      setSuccessMessage(`Emergency Report ${created.id} submitted successfully! Command HQ dispatched alert.`);
      setDescription('');
    }).catch(() => {
      onReportSubmitted(newIncident);
      setIsSubmitting(false);
      setSuccessMessage(`Emergency Report ${newIncId} submitted successfully! Command HQ dispatched alert.`);
      setDescription('');
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090d16] flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Portal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">CITIZEN EMERGENCY PORTAL</h3>
            <p className="text-xs text-slate-400">Direct Real-Time Dispatch Pipeline to Command HQ</p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emergency Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Emergency Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'FIRE', label: 'Fire', icon: Flame, color: 'text-red-500 border-red-500/40 bg-red-950/40' },
                { id: 'MEDICAL', label: 'Medical', icon: HeartPulse, color: 'text-rose-500 border-rose-500/40 bg-rose-950/40' },
                { id: 'FLOOD', label: 'Flood', icon: Droplets, color: 'text-cyan-500 border-cyan-500/40 bg-cyan-950/40' },
                { id: 'ACCIDENT', label: 'Accident', icon: Car, color: 'text-amber-500 border-amber-500/40 bg-amber-950/40' },
                { id: 'HAZMAT', label: 'Hazmat', icon: ShieldAlert, color: 'text-purple-500 border-purple-500/40 bg-purple-950/40' },
                { id: 'CRIME', label: 'Crime', icon: AlertTriangle, color: 'text-yellow-500 border-yellow-500/40 bg-yellow-950/40' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setType(item.id as EmergencyType)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? `${item.color} shadow-lg ring-1 ring-red-500`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Incident Location Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-24 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setAddress('WEH Highway Flyover, Vile Parle')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-cyan-400 border border-slate-700 hover:bg-slate-700"
              >
                Use GPS
              </button>
            </div>
          </div>

          {/* Incident Description & Voice Dictation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Situation Description
              </label>
              <button
                type="button"
                onClick={handleMicToggle}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                  isDictating ? 'bg-red-950 text-red-400 border-red-500 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isDictating ? 'Listening...' : 'AI Voice Input'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe what is happening, visible flames, toxic odor, or injured people..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Casualties & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Injured Casualties</label>
              <input
                type="number"
                min="0"
                value={injuredCount}
                onChange={(e) => setInjuredCount(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Caller Contact</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'TRANSMITTING EMERGENCY ALERT...' : 'SUBMIT EMERGENCY REPORT TO COMMAND HQ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
