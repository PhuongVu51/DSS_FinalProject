import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const REGIONS = ['hanoi', 'danang', 'hcm'];
const REGION_LABELS = { hanoi: '🏛️ Hà Nội', danang: '🌊 Đà Nẵng', hcm: '🌴 TP.HCM' };
const REGION_BADGES = { hanoi: { label: 'OPTIMIZED', color: '#10B981', bg: 'rgba(16,185,129,0.15)' }, danang: { label: 'BALANCED', color: '#bec6e0', bg: 'rgba(190,198,224,0.15)' }, hcm: { label: 'TRENDING', color: '#fb923c', bg: 'rgba(251,146,60,0.15)' } };
const REGION_ACCENT = { hanoi: 'var(--accent-cyan)', danang: 'var(--accent-pink)', hcm: '#bec6e0' };

export default function FormulaDeclPage() {
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/recipes')
      .then(r => r.json()).then(d => { setCakes(d); if (d.length > 0) setSelectedCake(d[0]); })
      .catch(console.error);
  }, [navigate]);

  useEffect(() => {
    if (!selectedCake) return;
    setActiveVariant(null);
    fetch(`http://localhost:8000/api/recipes/${encodeURIComponent(selectedCake)}/optimize`)
      .then(r => r.json()).then(setOptimization).catch(console.error);
  }, [selectedCake]);

  const displayRecipe = activeVariant 
    ? optimization?.regions?.[activeVariant]?.recipe
    : optimization?.original;
    
  const displayTitle = activeVariant
    ? `Công thức: ${REGION_LABELS[activeVariant]}`
    : "Công thức gốc";

  const ingredients = displayRecipe?.split('\n').filter(Boolean) || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '256px' }}>
        <TopBar />
        <main style={{ padding: '88px 40px 40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 className="text-headline-lg" style={{ marginBottom: '4px' }}>1. Khai báo Sản phẩm &amp; Công thức Gốc</h1>
              <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>Cấu hình thông số kỹ thuật và thiết lập công thức nền tảng cho quy trình R&D.</p>
            </div>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 2s infinite', display: 'inline-block' }}></span>
              <span className="text-label-mono" style={{ color: 'var(--accent-cyan)' }}>SESSION ACTIVE: FORMULA_RND_0924</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '24px', marginBottom: '32px' }}>
            {/* Left: Product Selector */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="text-label-mono" style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '8px' }}>LỰA CHỌN SẢN PHẨM</label>
                <select className="input-field" style={{ width: '100%' }} value={selectedCake} onChange={e => setSelectedCake(e.target.value)}>
                  {cakes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'linear-gradient(135deg,var(--accent-pink),var(--accent-pink-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎂</div>
                <div>
                  <p className="text-headline-sm" style={{ color: 'var(--accent-pink)' }}>{selectedCake}</p>
                  <p className="text-label-mono" style={{ color: 'var(--text-secondary)' }}>Product Code: RV-2024-CORE</p>
                </div>
              </div>

            </div>

            {/* Right: Formula */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.05, fontSize: '120px' }}>⚗️</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <span style={{ color: 'var(--accent-pink)', fontSize: '20px' }}>💧</span>
                <h2 className="text-headline-sm">{displayTitle}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ingredients.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Chọn sản phẩm để xem công thức...</p>
                ) : ingredients.map((line, i) => {
                  const colors = ['var(--accent-pink)', 'var(--accent-cyan)', '#bec6e0', '#909097'];
                  const color = colors[i % colors.length];
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', borderLeft: `4px solid ${color}`, transition: 'background 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="text-label-mono" style={{ color }}>{String(i + 1).padStart(2, '0')}</span>
                        <span>{line}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                {activeVariant && (
                  <button className="btn btn-ghost" onClick={() => setActiveVariant(null)} style={{ gap: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    🔄 KHÔI PHỤC BẢN GỐC
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Regional Recommendations */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 className="text-headline-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>KHUYẾN NGHỊ 3 CÔNG THỨC THỬ NGHIỆM</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            {REGIONS.map(region => {
              const data = optimization?.regions?.[region];
              const badge = REGION_BADGES[region];
              return (
                <div key={region} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                  <div style={{ padding: '20px', background: `linear-gradient(135deg, ${badge.bg} 0%, transparent 100%)`, borderBottom: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="text-headline-sm">{REGION_LABELS[region]}</span>
                      <span className="chip" style={{ background: badge.bg, color: badge.color, fontSize: '10px' }}>{badge.label}</span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{data?.message || 'Loading...'}</p>
                  </div>
                  <div style={{ padding: '20px', flex: 1 }}>
                    <textarea className="input-field" readOnly value={data?.recipe || ''} style={{ width: '100%', minHeight: '120px', fontSize: '13px', resize: 'none' }} />
                    <button onClick={() => setActiveVariant(region)} className="btn btn-ghost" style={{ width: '100%', marginTop: '12px', border: `1px solid ${REGION_ACCENT[region]}`, color: REGION_ACCENT[region], background: activeVariant === region ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                      {activeVariant === region ? '✅ Selected' : 'Select Variant'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
