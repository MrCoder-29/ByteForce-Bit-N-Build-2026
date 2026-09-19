import React, { useState } from 'react';
import { 
  Flame, 
  HeartPulse, 
  Car, 
  Waves, 
  Biohazard, 
  Building2, 
  MapPin, 
  Camera, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  AlertOctagon, 
  PhoneCall, 
  ShieldAlert,
  Loader2,
  X,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../services/apiService';

const CATEGORIES = [
  { id: 'fire', label: 'Fire / Explosion', icon: Flame, color: '#ef4444' },
  { id: 'medical', label: 'Medical Emergency', icon: HeartPulse, color: '#ec4899' },
  { id: 'crash', label: 'Highway Collision', icon: Car, color: '#f59e0b' },
  { id: 'flood', label: 'Flash Flood', icon: Waves, color: '#3b82f6' },
  { id: 'hazmat', label: 'HAZMAT / Toxic Leak', icon: Biohazard, color: '#10b981' },
  { id: 'collapse', label: 'Building Collapse', icon: Building2, color: '#8b5cf6' }
];

const PRESET_PHRASES = [
  'Heavy black smoke and visible flame spread',
  'People trapped inside vehicle / rubble',
  'Rapidly rising water above vehicle doors',
  'Strong chemical odor causing breathing difficulty',
  'Multiple casualties needing immediate ambulance'
];

const LANDMARKS = [
  { name: 'Apex Petrochem Complex, Sector 4', lat: 40.7128, lng: -74.0060 },
  { name: '5th St Viaduct & River Basin', lat: 40.7305, lng: -73.9925 },
  { name: 'Interstate 95 Northbound Mile 42', lat: 40.7450, lng: -73.9800 }
];

const SIMULATED_PHOTOS = [
  { name: 'Industrial Fire Blaze', url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=500&auto=format&fit=crop&q=60' },
  { name: 'Flooded Underpass', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=60' },
  { name: 'Highway Collision', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60' }
];

export default function CitizenReportView() {
  const [category, setCategory] = useState('fire');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Apex Petrochem Complex, Dock 14');
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });
  const [casualties, setCasualties] = useState('1-2');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // GPS Location Handler
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          // Fallback to simulated landmark
          const lm = LANDMARKS[0];
          setCoords({ lat: lm.lat, lng: lm.lng });
          setAddress(lm.name);
        }
      );
    } else {
      const lm = LANDMARKS[0];
      setCoords({ lat: lm.lat, lng: lm.lng });
      setAddress(lm.name);
    }
  };

  // Voice Note Simulation with live transcript
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setVoiceTranscript("911 Dispatch: Multiple explosions at the chemical storage tanks. Strong sulfur odor. Workers trapped near east gate!");
        if (!description) {
          setDescription("Multiple explosions at chemical storage tanks. Strong sulfur odor. Workers trapped near east gate!");
        }
        setIsRecording(false);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description && !voiceTranscript) {
      alert('Please provide a brief description or record an emergency voice note.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiService.submitCitizenReport({
        category,
        description: description || voiceTranscript,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        casualtiesCount: casualties === 'None' ? 0 : parseInt(casualties.split('-')[0]) || 2,
        mediaUrl: photoUrl,
        voiceTranscript
      });

      setSubmissionResult(result);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setDescription('');
    setVoiceTranscript('');
    setPhotoUrl(null);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
      {/* SOS Header Banner */}
      <div style={{
        backgroundColor: '#7f1d1d',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: '#ef4444',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="beacon-pulse">
            <AlertOctagon size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
              CITIZEN EMERGENCY PORTAL
            </h2>
            <p style={{ fontSize: '12px', color: '#fca5a5' }}>
              Direct pipeline to Metro 911 Dispatch & Automated First Responders
            </p>
          </div>
        </div>

        <a
          href="tel:911"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff',
            color: '#991b1b',
            padding: '8px 14px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <PhoneCall size={16} /> CALL 911
        </a>
      </div>

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '20px' }}>
        {/* Step 1: Emergency Category */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
            1. SELECT EMERGENCY TYPE *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 8px',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${cat.color}` : '1px solid #334155',
                    backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.15)' : '#1e293b',
                    color: isSelected ? '#fff' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={24} color={isSelected ? cat.color : '#94a3b8'} />
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 500, textAlign: 'center' }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Location & GPS */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
              2. INCIDENT LOCATION *
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                color: '#60a5fa',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MapPin size={13} /> Use My GPS Location
            </button>
          </div>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, cross-streets, or landmark..."
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              marginBottom: '8px'
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {LANDMARKS.map((lm, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAddress(lm.name);
                  setCoords({ lat: lm.lat, lng: lm.lng });
                }}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                📍 {lm.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Emergency Description & Quick Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
            3. WHAT IS HAPPENING? *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you see: flames, injured people, chemical smell, hazards..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              marginBottom: '8px',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRESET_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(prev => prev ? `${prev}. ${phrase}` : phrase)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  color: '#cbd5e1',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                + {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Voice Note / 911 Audio Simulator */}
        <div style={{
          marginBottom: '20px',
          padding: '12px 14px',
          backgroundColor: '#0d131f',
          border: '1px solid #1e293b',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: isRecording ? '#ef4444' : '#334155',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isRecording ? <Mic size={18} color="#fff" /> : <MicOff size={18} color="#94a3b8" />}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  {isRecording ? 'Recording 911 Voice Note...' : 'Record 911 Audio Note'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Speech-to-Text auto-transcribed for emergency triage
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              style={{
                backgroundColor: isRecording ? '#b91c1c' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isRecording ? 'Stop Recording' : 'Start Voice Note'}
            </button>
          </div>

          {/* Visual Waveform while recording */}
          {isRecording && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '36px',
              marginTop: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px'
            }}>
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginLeft: '8px' }}>
                TRANSCRIPTION ACTIVE
              </span>
            </div>
          )}

          {voiceTranscript && (
            <div style={{
              marginTop: '10px',
              padding: '8px 10px',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              borderLeft: '3px solid #3b82f6',
              fontSize: '12px',
              color: '#cbd5e1'
            }}>
              <strong>Transcribed Audio:</strong> "{voiceTranscript}"
            </div>
          )}
        </div>

        {/* Step 5: Casualties & Photo Simulation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              People Injured / Trapped
            </label>
            <select
              value={casualties}
              onChange={(e) => setCasualties(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px'
              }}
            >
              <option value="None">None / Unknown</option>
              <option value="1-2">1 - 2 Persons</option>
              <option value="3-5">3 - 5 Persons</option>
              <option value="5+">5+ Critical (Mass Casualty)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Photo / Camera Evidence
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPhotoUrl(SIMULATED_PHOTOS[0].url)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <Camera size={14} /> Attach Photo
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  style={{
                    background: '#7f1d1d',
                    border: 'none',
                    color: '#fca5a5',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {photoUrl && (
          <div style={{ marginBottom: '20px', position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
            <img src={photoUrl} alt="Emergency Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{
              position: 'absolute',
              bottom: '6px',
              left: '8px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              SIMULATED PHOTO EVIDENCE ATTACHED
            </span>
          </div>
        )}

        {/* Big SOS Transmit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="beacon-pulse" /> TRANSMITTING TO DISPATCH...
            </>
          ) : (
            <>
              <Send size={20} /> TRANSMIT EMERGENCY SOS
            </>
          )}
        </button>
      </form>

      {/* Confirmation SOS Modal */}
      {submissionResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 10000
        }}>
          <div className="glass-panel glow-emerald" style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#0f172a',
            border: '2px solid #10b981',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                EMERGENCY SOS TRANSMITTED
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Incident registered in Metro Emergency Network
              </p>
            </div>

            {/* Tracking Badge */}
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                <span>Incident Reference ID:</span>
                <strong style={{ color: '#60a5fa' }}>{submissionResult.referenceId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                <span>Status:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>DISPATCHED TO FIELD TEAMS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                <span>Assigned Unit:</span>
                <span style={{ color: '#f8fafc' }}>Engine 7 (Hazmat/Pumper)</span>
              </div>
            </div>

            {/* Simulated SMS Notification */}
            <div style={{
              backgroundColor: '#0d131f',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px dashed #3b82f6',
              marginBottom: '20px',
              fontSize: '11px',
              color: '#cbd5e1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>
                <MessageSquare size={13} /> Simulated SMS Confirmation:
              </div>
              "911 Emergency Alert: Your report #{submissionResult.referenceId} is confirmed. Engine 7 is en route (ETA ~3m). Stay in a safe location."
            </div>

            {/* Citizen Safety SOP Guidance */}
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid #f59e0b',
              fontSize: '12px',
              color: '#fde68a'
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Immediate Safety Instructions:</strong>
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                <li>Move upwind if smoke or chemical vapors are present.</li>
                <li>Do not attempt to enter burning or structurally compromised areas.</li>
                <li>Keep your mobile line open for first responder call-back.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Submit Another Report / Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
