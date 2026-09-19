import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Clock, 
  Flame, 
  Radio, 
  CheckSquare, 
  Square, 
  Navigation, 
  Truck, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { soundEffects } from '../services/soundEffects';

const UNIT_PRESETS = [
  { unitId: 'ENGINE-7', name: 'Engine 7 (Fire & Hazmat Pumper)', role: 'Primary Suppression' },
  { unitId: 'MEDIC-4', name: 'Trauma ALS Medic 4', role: 'Advanced Life Support' },
  { unitId: 'HAZMAT-1', name: 'Hazmat Heavy Rescue 1', role: 'Chemical Specialist' },
  { unitId: 'BOAT-2', name: 'Swift Water Boat 2', role: 'Amphibious Rescue' }
];

export default function ResponderView() {
  const [dispatch, setDispatch] = useState(null);
  const [responder, setResponder] = useState(apiService.getResponderProfile());
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState(responder.unitId);

  useEffect(() => {
    // Initial fetch
    setDispatch(apiService.getActiveDispatch());
    setResponder(apiService.getResponderProfile());

    // Subscribe to updates
    const unsubscribe = apiService.subscribe((eventType, data) => {
      if (eventType === 'ACTIVE_DISPATCH_UPDATED' || eventType === 'SCENARIO_LOADED' || eventType === 'STATUS_UPDATED') {
        setDispatch(apiService.getActiveDispatch());
        setResponder(apiService.getResponderProfile());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!dispatch) return;
    setIsUpdating(true);
    try {
      await apiService.updateResponderStatus(dispatch.id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSop = (taskId) => {
    apiService.toggleSopTask(taskId);
  };

  if (!dispatch) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '20px', textAlign: 'center' }} className="glass-panel">
        <Shield size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>NO ACTIVE DISPATCH CALL</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
          Unit {responder.unitName} is currently staged and in service. Waiting for CAD dispatch orders.
        </p>
      </div>
    );
  }

  const isDispatched = dispatch.status === 'DISPATCHED';
  const isEnRoute = dispatch.status === 'EN_ROUTE';
  const isOnScene = dispatch.status === 'ON_SCENE';
  const isResolved = dispatch.status === 'RESOLVED';

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
      {/* Unit Profile & Switcher Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '6px',
            borderRadius: '6px'
          }}>
            <Truck size={18} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              {responder.unitName}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Field CAD Mobile Terminal • Call-Sign: #{responder.unitId}
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <select
          value={activeUnitId}
          onChange={(e) => {
            setActiveUnitId(e.target.value);
            const found = UNIT_PRESETS.find(u => u.unitId === e.target.value);
            if (found) {
              responder.unitId = found.unitId;
              responder.unitName = found.name;
              setResponder({ ...responder });
            }
          }}
          style={{
            backgroundColor: '#1e293b',
            color: '#cbd5e1',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px'
          }}
        >
          {UNIT_PRESETS.map(u => (
            <option key={u.unitId} value={u.unitId}>{u.unitId} - {u.role}</option>
          ))}
        </select>
      </div>

      {/* Flashing Urgent Dispatch Alert Card */}
      <div className={`glass-panel ${isDispatched ? 'glow-red' : ''}`} style={{
        padding: '20px',
        border: isDispatched ? '2px solid #ef4444' : '1px solid #1f2937',
        marginBottom: '16px'
      }}>
        {/* Status & Priority Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isResolved ? '#10b981' : '#ef4444',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isResolved ? '#10b981' : '#ef4444'
              }} className={isResolved ? '' : 'beacon-pulse'} />
              {dispatch.status}
            </span>

            <span style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              padding: '4px 8px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {dispatch.category}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: dispatch.severity === 'CRITICAL' ? '#7f1d1d' : '#854d0e',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              SEVERITY: {dispatch.severity} ({dispatch.severityScore}/5)
            </span>
          </div>
        </div>

        {/* Incident Title & Duplicates Count */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          {dispatch.title}
        </h2>

        {/* Multi-source Cluster pill */}
        {dispatch.mergedReportsCount > 1 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid #3b82f6',
            color: '#93c5fd',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            marginBottom: '14px'
          }}>
            <Users size={13} /> {dispatch.mergedReportsCount} converging reports consolidated by AI deduplication
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px' }}>
          {dispatch.description}
        </p>

        {/* Location & Navigation Card */}
        <div style={{
          backgroundColor: '#0a0e17',
          border: '1px solid #1f2937',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>
              <MapPin size={14} /> {dispatch.location.address}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Coords: {dispatch.location.coordinates[0].toFixed(4)}, {dispatch.location.coordinates[1].toFixed(4)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>1.4 km</div>
              <div style={{ fontSize: '10px', color: '#10b981' }}>ETA ~3 mins</div>
            </div>
            <button
              type="button"
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dispatch.location.coordinates[0]},${dispatch.location.coordinates[1]}`, '_blank')}
              style={{
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Navigation size={12} /> Nav
            </button>
          </div>
        </div>

        {/* AI Tactical Triage & SOP Checklist */}
        <div style={{
          backgroundColor: '#0d131f',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#a78bfa', fontSize: '12px', fontWeight: 700 }}>
            <Sparkles size={14} /> AI TACTICAL SOP & SAFETY CHECKLIST
          </div>

          <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
            "{dispatch.aiTriage?.summary || 'Follow tactical standards for priority response.'}"
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dispatch.tacticalSop && dispatch.tacticalSop.map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleSop(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.1)' : '#1e293b',
                  border: task.completed ? '1px solid #10b981' : '1px solid #334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {task.completed ? (
                  <CheckSquare size={16} color="#10b981" />
                ) : (
                  <Square size={16} color="#94a3b8" />
                )}
                <span style={{
                  fontSize: '12px',
                  color: task.completed ? '#a7f3d0' : '#e2e8f0',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Co-Responders */}
        {dispatch.assignedResources && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
              ASSIGNED CO-RESPONDERS ON CALL:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {dispatch.assignedResources.map(res => (
                <div
                  key={res.unitId}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#cbd5e1'
                  }}
                >
                  🚒 <strong>{res.name}</strong> ({res.type}) • ETA {res.eta}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lifecycle Action Buttons (Progressive Dispatch States) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {isDispatched && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('EN_ROUTE')}
              style={{
                flex: 1,
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Radio size={18} /> ACKNOWLEDGE & ROLLING (EN ROUTE)
            </button>
          )}

          {isEnRoute && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('ON_SCENE')}
              style={{
                flex: 1,
                backgroundColor: '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
              }}
            >
              <MapPin size={18} /> CONFIRM ON-SCENE ARRIVAL
            </button>
          )}

          {isOnScene && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('RESOLVED')}
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={18} /> ALL CLEAR: INCIDENT RESOLVED
            </button>
          )}

          {isResolved && (
            <button
              type="button"
              onClick={() => handleStatusChange('DISPATCHED')}
              style={{
                flex: 1,
                backgroundColor: '#334155',
                color: '#94a3b8',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={15} /> Reset Call to Dispatched (Demo Loop)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
