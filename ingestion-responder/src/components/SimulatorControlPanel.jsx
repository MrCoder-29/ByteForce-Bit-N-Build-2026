import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Flame, 
  Waves, 
  Car, 
  Zap, 
  Server, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Radio, 
  Code, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { DEMO_SCENARIOS } from '../data/mockScenarios';

export default function SimulatorControlPanel() {
  const [apiUrl, setApiUrl] = useState(apiService.getBaseUrl());
  const [isMockMode, setIsMockMode] = useState(apiService.isMockMode);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [eventLog, setEventLog] = useState([]);
  const [selectedPayload, setSelectedPayload] = useState(null);

  useEffect(() => {
    setEventLog([...apiService.getEventLog()]);

    const unsubscribe = apiService.subscribe((eventType, data) => {
      if (eventType === 'EVENT_LOG_UPDATED') {
        setEventLog(prev => [data, ...prev.slice(0, 29)]);
      } else if (eventType === 'CONNECTION_CHANGED') {
        setIsMockMode(data.isMockMode);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUrl = (e) => {
    e.preventDefault();
    apiService.setBaseUrl(apiUrl);
  };

  const handleTriggerScenario = async (scenarioKey) => {
    setIsTriggering(true);
    setActiveScenario(scenarioKey);
    try {
      await apiService.triggerDemoScenario(scenarioKey);
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleChaosBurst = async () => {
    setIsTriggering(true);
    const keys = ['chemical_fire', 'flash_flood', 'highway_collision'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    await handleTriggerScenario(randomKey);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={20} color="#3b82f6" /> DEMO EMERGENCY SCENARIO SIMULATOR
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Deterministic event generator for multi-source ingestion & presentation demos
          </p>
        </div>

        {/* Backend Connection Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: isMockMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: '1px solid',
          borderColor: isMockMode ? '#f59e0b' : '#10b981',
          fontSize: '12px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isMockMode ? '#f59e0b' : '#10b981'
          }} className="beacon-pulse" />
          <span style={{ fontWeight: 600, color: isMockMode ? '#fde68a' : '#a7f3d0' }}>
            {isMockMode ? 'Mock Adapter Mode (Zero Setup)' : 'Live Backend Connected'}
          </span>
        </div>
      </div>

      {/* Backend Target URL Config Bar */}
      <form onSubmit={handleUpdateUrl} className="glass-panel" style={{
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
          <Server size={15} color="#60a5fa" />
          <span>Ingestion Endpoint Target:</span>
        </div>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="http://localhost:8000"
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '6px 10px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '12px'
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={13} /> Reconnect
        </button>
      </form>

      {/* 3 Core Presentation Scenarios from PS-9 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Play size={15} color="#ef4444" /> TRIGGER DEMO SCENARIOS (ONE-CLICK DISPATCH)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* Scenario A: Chemical Fire */}
          <div className="glass-panel glow-red" style={{
            padding: '16px',
            border: activeScenario === 'chemical_fire' ? '2px solid #ef4444' : '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  SCENARIO A • CRITICAL 5/5
                </span>
                <Flame size={20} color="#ef4444" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                5-Alarm Industrial Chemical Fire
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                Generates 1 911 audio transcript, 3 duplicate citizen reports within 200m radius, and 1 IoT toxic gas spike (480 PPM).
              </p>
              <div style={{ fontSize: '11px', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                🎯 <strong>Reqs:</strong> HAZMAT Unit 1 + Class-B Foam
              </div>
            </div>

            <button
              type="button"
              disabled={isTriggering}
              onClick={() => handleTriggerScenario('chemical_fire')}
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '10px',
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
              <Play size={14} /> Trigger Scenario A
            </button>
          </div>

          {/* Scenario B: Flash Flood */}
          <div className="glass-panel glow-blue" style={{
            padding: '16px',
            border: activeScenario === 'flash_flood' ? '2px solid #3b82f6' : '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  SCENARIO B • HIGH 4/5
                </span>
                <Waves size={20} color="#3b82f6" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                Flash Flood Sensor Alert
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                Triggers River Basin Ultrasonic Sensor (4.2m flood surge) + 2 stranded motorist 911 calls at the 5th St viaduct.
              </p>
              <div style={{ fontSize: '11px', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                🎯 <strong>Reqs:</strong> Swift Water Rescue Boat 2
              </div>
            </div>

            <button
              type="button"
              disabled={isTriggering}
              onClick={() => handleTriggerScenario('flash_flood')}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '10px',
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
              <Play size={14} /> Trigger Scenario B
            </button>
          </div>

          {/* Scenario C: Road Collision */}
          <div className="glass-panel glow-amber" style={{
            padding: '16px',
            border: activeScenario === 'highway_collision' ? '2px solid #f59e0b' : '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  SCENARIO C • HIGH 4/5
                </span>
                <Car size={20} color="#f59e0b" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                Road Collision on Highway
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                Triggers 2 citizen emergency reports for 3-vehicle tanker pileup on Interstate I-95 with trapped victims and fuel spill.
              </p>
              <div style={{ fontSize: '11px', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                🎯 <strong>Reqs:</strong> Hydraulic Jaws of Life + Trauma ALS
              </div>
            </div>

            <button
              type="button"
              disabled={isTriggering}
              onClick={() => handleTriggerScenario('highway_collision')}
              style={{
                width: '100%',
                backgroundColor: '#f59e0b',
                color: '#fff',
                border: 'none',
                padding: '10px',
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
              <Play size={14} /> Trigger Scenario C
            </button>
          </div>
        </div>
      </div>

      {/* Quick Chaos Burst Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        border: '1px solid #334155',
        marginBottom: '24px'
      }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="#eab308" /> Stress-Test Chaos Injection
          </h4>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>
            Inject sudden random emergency bursts to demonstrate real-time queueing and triage
          </p>
        </div>
        <button
          type="button"
          onClick={handleChaosBurst}
          disabled={isTriggering}
          style={{
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ⚡ Fire Chaos Burst
        </button>
      </div>

      {/* Live Event Stream / Ingestion Inspector */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={15} color="#10b981" /> INGESTION EVENT AUDIT LOG
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {eventLog.length} events captured in active session
          </span>
        </div>

        <div style={{
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {eventLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
              No events generated yet. Click any scenario above to trigger ingestion.
            </div>
          ) : (
            eventLog.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedPayload(ev.payload || ev)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#0f172a',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: ev.type.includes('CITIZEN') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: ev.type.includes('CITIZEN') ? '#60a5fa' : '#f87171'
                  }}>
                    {ev.type}
                  </span>
                  <span style={{ color: '#e2e8f0' }}>{ev.message}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>

        {/* Selected Payload Modal / Drawer */}
        {selectedPayload && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#0a0e17',
            borderRadius: '6px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>RAW INGESTION JSON PAYLOAD</span>
              <button
                onClick={() => setSelectedPayload(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            <pre style={{
              margin: 0,
              fontSize: '11px',
              color: '#38bdf8',
              fontFamily: 'monospace',
              maxHeight: '140px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
