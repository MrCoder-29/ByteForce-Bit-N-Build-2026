import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Flame, 
  Waves, 
  Biohazard, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Square,
  Sparkles
} from 'lucide-react';
import { SIMULATED_SENSORS } from '../data/mockScenarios';
import { apiService } from '../services/apiService';

export default function SensorSimulatorView() {
  const [sensors, setSensors] = useState(SIMULATED_SENSORS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [latestPayload, setLatestPayload] = useState(null);

  // Periodic Telemetry Pulse Stream
  useEffect(() => {
    let interval = null;
    if (isStreaming) {
      interval = setInterval(() => {
        // Pick a random sensor to pulse normal telemetry or slight drift
        const idx = Math.floor(Math.random() * sensors.length);
        const sensor = sensors[idx];
        const drift = (Math.random() * 0.1 - 0.05) * sensor.normalValue;
        const simulatedVal = +(sensor.normalValue + drift).toFixed(2);

        setSensors(prev => prev.map((s, i) => i === idx ? { ...s, currentValue: simulatedVal } : s));

        apiService.logSystemEvent('SENSOR_TELEMETRY_HEARTBEAT', `Heartbeat from ${sensor.id}: ${simulatedVal} ${sensor.unit}`);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isStreaming, sensors]);

  const handleTriggerAnomaly = async (sensorId) => {
    const target = sensors.find(s => s.id === sensorId);
    if (!target) return;

    // Set sensor into Critical Anomaly state
    setSensors(prev => prev.map(s => {
      if (s.id === sensorId) {
        return {
          ...s,
          currentValue: s.dangerValue,
          status: 'ANOMALY_BREACH'
        };
      }
      return s;
    }));

    const result = await apiService.sendSensorTelemetry({
      sensorId: target.id,
      sensorType: target.type,
      metric: target.metricName,
      value: `${target.dangerValue} ${target.unit}`,
      threshold: `${target.normalValue * 2} ${target.unit}`,
      location: {
        name: target.location,
        lat: target.coordinates[0],
        lng: target.coordinates[1]
      }
    });

    setLatestPayload(result.payload);
  };

  const handleResetSensor = (sensorId) => {
    setSensors(prev => prev.map(s => {
      if (s.id === sensorId) {
        return {
          ...s,
          currentValue: s.normalValue,
          status: 'NORMAL'
        };
      }
      return s;
    }));
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '16px' }}>
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
            <Activity size={20} color="#10b981" /> IOT ENVIRONMENTAL & SENSOR SIMULATOR
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Simulate city infrastructure telemetry streams, water gauges & toxic gas detectors
          </p>
        </div>

        <button
          onClick={() => setIsStreaming(!isStreaming)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isStreaming ? '#7f1d1d' : '#1e293b',
            border: '1px solid',
            borderColor: isStreaming ? '#ef4444' : '#3b82f6',
            color: isStreaming ? '#fca5a5' : '#60a5fa',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isStreaming ? (
            <>
              <Square size={13} fill="#ef4444" /> Stop Telemetry Heartbeat
            </>
          ) : (
            <>
              <Play size={13} fill="#3b82f6" /> Stream Background Heartbeat
            </>
          )}
        </button>
      </div>

      {/* Sensor Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {sensors.map(sensor => {
          const isAnomaly = sensor.status === 'ANOMALY_BREACH';
          return (
            <div
              key={sensor.id}
              className={`glass-panel ${isAnomaly ? 'glow-red' : ''}`}
              style={{
                padding: '16px',
                border: isAnomaly ? '2px solid #ef4444' : '1px solid #1f2937'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                    {sensor.id}
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {sensor.name}
                  </h4>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: isAnomaly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isAnomaly ? '#ef4444' : '#10b981'
                }}>
                  {isAnomaly ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                  {sensor.status}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                📍 {sensor.location} • Type: {sensor.type}
              </div>

              {/* Metric Gauge Display */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{sensor.metricName}</div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: isAnomaly ? '#ef4444' : '#38bdf8',
                    fontFamily: 'monospace'
                  }}>
                    {sensor.currentValue} <span style={{ fontSize: '13px', fontWeight: 500 }}>{sensor.unit}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8' }}>
                  <div>Baseline: {sensor.normalValue} {sensor.unit}</div>
                  <div style={{ color: '#ef4444' }}>Danger: ≥ {sensor.dangerValue} {sensor.unit}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleTriggerAnomaly(sensor.id)}
                  style={{
                    flex: 1,
                    backgroundColor: isAnomaly ? '#991b1b' : '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertTriangle size={13} /> Trigger Anomaly Spike
                </button>

                {isAnomaly && (
                  <button
                    type="button"
                    onClick={() => handleResetSensor(sensor.id)}
                    style={{
                      backgroundColor: '#334155',
                      color: '#cbd5e1',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest Telemetry JSON Box */}
      {latestPayload && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>
            TRANSMITTED SENSOR TELEMETRY PAYLOAD (TO INGESTION GATEWAY)
          </h4>
          <pre style={{
            margin: 0,
            fontSize: '11px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            backgroundColor: '#0a0e17',
            padding: '12px',
            borderRadius: '6px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(latestPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
