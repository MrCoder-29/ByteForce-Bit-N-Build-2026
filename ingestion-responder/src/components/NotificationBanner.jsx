import React, { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, AlertTriangle, ShieldCheck, Siren, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { soundEffects } from '../services/soundEffects';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState([]);
  const [muted, setMuted] = useState(soundEffects.isMuted());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Initial fetch
    setNotifications([...apiService.getNotifications()]);

    // Subscribe to new notifications
    const unsubscribe = apiService.subscribe((eventType, data) => {
      if (eventType === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data, ...prev.slice(0, 19)]);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSound = () => {
    const isMute = soundEffects.toggleMute();
    setMuted(isMute);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const latestAlert = notifications[0];

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      {/* Sound & Alert Ticker Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#0d131f',
        borderBottom: '1px solid #1e293b',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.05em'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'inline-block'
            }} className="beacon-pulse" />
            LIVE DISPATCH NET
          </span>

          {latestAlert ? (
            <span style={{ color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
              <strong>{latestAlert.title}:</strong> {latestAlert.message}
            </span>
          ) : (
            <span style={{ color: '#64748b' }}>Monitoring multi-channel emergency incoming feeds...</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <Bell size={14} />
            <span>Alerts ({notifications.length})</span>
          </button>

          <button
            onClick={toggleSound}
            title={muted ? "Unmute Emergency Sirens" : "Mute Sirens"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: muted ? '#334155' : 'rgba(239, 68, 68, 0.2)',
              border: '1px solid',
              borderColor: muted ? '#475569' : '#ef4444',
              color: muted ? '#94a3b8' : '#ef4444',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Floating Active Toast (Auto pop on new critical dispatch) */}
      {latestAlert && (
        <div style={{
          position: 'fixed',
          top: '52px',
          right: '20px',
          maxWidth: '380px',
          backgroundColor: latestAlert.type === 'escalation' ? '#7f1d1d' : '#1e293b',
          border: '1px solid',
          borderColor: latestAlert.type === 'escalation' ? '#ef4444' : '#3b82f6',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          animation: 'slideIn 0.3s ease'
        }}>
          {latestAlert.type === 'escalation' ? (
            <Siren size={22} color="#fca5a5" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : latestAlert.type === 'dispatch' ? (
            <AlertTriangle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <ShieldCheck size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{latestAlert.title}</h4>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{latestAlert.timestamp}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{latestAlert.message}</p>
          </div>

          <button
            onClick={() => removeNotification(latestAlert.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Slide-out Notification Drawer */}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: '48px',
          right: 0,
          bottom: 0,
          width: '340px',
          backgroundColor: '#0f172a',
          borderLeft: '1px solid #1e293b',
          padding: '16px',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '-8px 0 25px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} /> Notification Log
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f1f5f9', fontWeight: 600 }}>
                  <span>{n.title}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{n.timestamp}</span>
                </div>
                <div style={{ color: '#cbd5e1', marginTop: '4px' }}>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
