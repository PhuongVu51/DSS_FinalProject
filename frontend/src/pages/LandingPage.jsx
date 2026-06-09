import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="header">
        <div className="header-left">
          <span className="logo">R&D OS</span>
          <nav className="nav-links">
            <a href="#" className="active">Dashboard</a>
            <a href="#">Inventory</a>
            <a href="#">Reports</a>
          </nav>
        </div>
        <div className="header-right">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>LOG IN</button>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg-glow"></div>
          <div className="hero-content">
            <span className="badge">NEXT-GEN R&D OPERATING SYSTEM</span>
            <h1 className="text-display">
              The Future of R&D is <br/>
              <span className="text-gradient">AI-Optimized</span>
            </h1>
            <p className="hero-subtitle text-body-md">
              Unify formula declaration, market insights, and real-time sensory feedback into a single high-velocity intelligence layer. Built for the data-first researcher.
            </p>
            
            <div className="glass-card hero-cta">
              <div className="cta-info">
                <div className="status">
                  <span className="status-icon">⚡</span>
                  <span className="text-label-mono text-tertiary">LIVE SYSTEM STATUS: OPTIMIZED</span>
                </div>
                <p className="text-body-sm">Accelerate your R&D pipeline by 40% with automated market alignment and variant simulations.</p>
              </div>
              <div className="cta-actions">
                <button className="btn btn-secondary" style={{backgroundColor: 'var(--accent-pink)', color: 'white', borderColor: 'var(--accent-pink)'}}>Book Demo</button>
                <button className="btn btn-ghost" style={{border: '1px solid var(--border-glass)'}}>Explore R&D OS</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Adding styles specific to the page */}
      <style>{`
        .landing-page {
          min-height: 100vh;
        }
        .header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 64px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 50;
        }
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: 900;
          color: var(--accent-pink);
          letter-spacing: -1px;
        }
        .nav-links {
          display: flex;
          gap: 24px;
          margin-left: 48px;
        }
        .nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }
        .nav-links a:hover, .nav-links a.active {
          color: var(--accent-cyan);
        }
        
        .hero {
          padding-top: 120px;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
        }
        .hero-bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: rgba(34, 211, 238, 0.1);
          filter: blur(120px);
          border-radius: 50%;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .badge {
          background: rgba(34, 211, 238, 0.1);
          color: var(--accent-cyan);
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 4px 16px;
          border-radius: var(--radius-full);
          font-family: var(--font-mono);
          font-size: 12px;
          margin-bottom: 24px;
        }
        .text-gradient {
          background: linear-gradient(90deg, var(--accent-cyan), var(--accent-pink), var(--accent-cyan));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 4s linear infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .hero-subtitle {
          color: var(--text-secondary);
          max-width: 600px;
          margin: 24px auto 48px;
        }
        .hero-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          padding: 24px;
          text-align: left;
          width: 100%;
          max-width: 700px;
        }
        .cta-info {
          flex: 1;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .text-tertiary {
          color: var(--accent-cyan);
        }
        .cta-actions {
          display: flex;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}
