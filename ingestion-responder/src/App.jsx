import React, { useState } from 'react';
import { 
  PhoneCall, 
  Truck, 
  Radio, 
  Activity, 
  Columns, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';
import NotificationBanner from './components/NotificationBanner';
import CitizenReportView from './components/CitizenReportView';
import ResponderView from './components/ResponderView';
import SimulatorControlPanel from './components/SimulatorControlPanel';
import SensorSimulatorView from './components/SensorSimulatorView';

export default function App() {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen', 'responder', 'simulator', 'sensors', 'split'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e17', display: 'flex', flexDirection: 'column' }}>
      {/* Real-time Notification Banner & Sound Engine */}
      <NotificationBanner />

      {/* Main Header / Navigation */}
      <header style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand & Team ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: '#ef4444',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.03em' }}>
                ResQSync
              </h1>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                PS-9 • MEMBER 4
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#94a3b8'
              }}>
                Team ByteForce
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              Multi-Channel Emergency Ingestion & Responder Dispatch Terminal
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0a0e17',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #1e293b',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('citizen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'citizen' ? '#ef4444' : 'transparent',
              color: activeTab === 'citizen' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <PhoneCall size={14} /> Citizen SOS
          </button>

          <button
            onClick={() => setActiveTab('responder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'responder' ? '#3b82f6' : 'transparent',
              color: activeTab === 'responder' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Truck size={14} /> Field Responder
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'simulator' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'simulator' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Radio size={14} /> Scenarios (Demo)
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'sensors' ? '#10b981' : 'transparent',
              color: activeTab === 'sensors' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={14} /> IoT Sensors
          </button>

          <button
            onClick={() => setActiveTab('split')}
            title="Side-by-Side Presentation View for Hackathon Judges"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'split' ? '#f59e0b' : 'transparent',
              color: activeTab === 'split' ? '#000' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Columns size={14} /> Live Demo Split
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {activeTab === 'citizen' && <CitizenReportView />}
        {activeTab === 'responder' && <ResponderView />}
        {activeTab === 'simulator' && <SimulatorControlPanel />}
        {activeTab === 'sensors' && <SensorSimulatorView />}

        {/* Presentation Split-Screen View: Shows end-to-end loop on 1 screen */}
        {activeTab === 'split' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Top Quick Trigger Toolbar */}
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  ⚡ LIVE JUDGING FLOW:
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Citizen submits report on left ➔ Dispatched to Field Responder on right instantly!
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> Full Hackathon Demo Loop Active
              </div>
            </div>

            {/* Split Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '20px',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fca5a5'
                }}>
                  STEP 1: CITIZEN REPORTING INGESTION (MOBILE VIEW)
                </div>
                <div style={{ border: '1px solid #1e293b', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                  <CitizenReportView />
                </div>
              </div>

              <div>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#93c5fd'
                }}>
                  STEP 2: FIELD RESPONDER CAD DISPATCH (MOBILE/TABLET VIEW)
                </div>
                <div style={{ border: '1px solid #1e293b', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                  <ResponderView />
                </div>
              </div>
            </div>

            {/* Bottom Ingestion Simulator Bar */}
            <div style={{ marginTop: '24px' }}>
              <SimulatorControlPanel />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0d131f',
        borderTop: '1px solid #1e293b',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <span>ByteForce • Problem Statement 9: Intelligent Emergency Response Platform</span>
        <span>Module: Data Ingestion + Sensor Simulator + Field Responder Experience</span>
      </footer>
    </div>
  );
}
