import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FormulaPage() {
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Fetch cakes
    fetch('http://localhost:8000/api/recipes')
      .then(res => res.json())
      .then(data => {
        setCakes(data);
        if (data.length > 0) setSelectedCake(data[0]);
      })
      .catch(err => console.error("Error fetching recipes:", err));
  }, [navigate]);

  useEffect(() => {
    if (!selectedCake) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/recipes/${encodeURIComponent(selectedCake)}/optimize`)
      .then(res => res.json())
      .then(data => {
        setOptimization(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching optimization:", err);
        setLoading(false);
      });
  }, [selectedCake]);

  if (!user) return null;

  return (
    <div className="formula-page">
      <header className="header">
        <div className="header-left">
          <span className="logo">R&D OS</span>
          <nav className="nav-links">
            <a href="/" >Landing</a>
            <a href="/formula" className="active">Formula Declaration</a>
            <a href="/feedback">Feedback Monitor</a>
          </nav>
        </div>
        <div className="header-right">
          <span className="text-body-sm" style={{color: 'var(--text-secondary)'}}>
            {user.fullname} <span style={{color: 'var(--accent-pink)'}}>({user.role})</span>
          </span>
          <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            LOG OUT
          </button>
        </div>
      </header>

      <main className="container" style={{paddingTop: '100px', paddingBottom: '40px'}}>
        <div style={{marginBottom: '32px'}}>
          <h1 className="text-headline-lg">⚙️ Phân tích và Tự động May đo Công thức</h1>
          <p className="text-body-md text-secondary">Công cụ hỗ trợ phân tích thị hiếu khu vực và tinh chỉnh công thức sản xuất</p>
        </div>

        <div className="glass-card" style={{marginBottom: '32px'}}>
          <label className="input-label" style={{marginBottom: '8px'}}>Chọn sản phẩm bánh cần phân tích:</label>
          <select 
            className="input-field" 
            style={{width: '100%', maxWidth: '400px'}}
            value={selectedCake}
            onChange={(e) => setSelectedCake(e.target.value)}
          >
            {cakes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div style={{marginTop: '24px'}}>
            <label className="input-label" style={{marginBottom: '8px'}}>Công thức gốc tiêu chuẩn hiện tại:</label>
            <textarea 
              className="input-field" 
              style={{width: '100%', minHeight: '120px', resize: 'vertical'}}
              value={optimization?.original || ''}
              readOnly
            />
          </div>
        </div>

        <h2 className="text-headline-sm" style={{marginBottom: '24px'}}>📍 Đề xuất công thức tối ưu hóa theo khẩu vị vùng miền (Thuật toán DSS)</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'var(--accent-cyan)'}}>Đang phân tích dữ liệu...</div>
        ) : (
          <div className="grid-12">
            {/* Hanoi */}
            <div style={{gridColumn: 'span 4'}} className="glass-card region-card">
              <h3 className="text-body-md" style={{fontWeight: 'bold', marginBottom: '16px'}}>🏛️ Chi Nhánh Hà Nội</h3>
              <div className="chip chip-cyan" style={{marginBottom: '16px', fontSize: '11px', whiteSpace: 'normal', height: 'auto', padding: '8px'}}>
                {optimization?.regions?.hanoi?.message}
              </div>
              <textarea 
                className="input-field" 
                style={{width: '100%', minHeight: '150px'}}
                value={optimization?.regions?.hanoi?.recipe || ''}
                readOnly
              />
            </div>

            {/* Da Nang */}
            <div style={{gridColumn: 'span 4'}} className="glass-card region-card">
              <h3 className="text-body-md" style={{fontWeight: 'bold', marginBottom: '16px'}}>🌊 Chi Nhánh Đà Nẵng</h3>
              <div className="chip chip-success" style={{marginBottom: '16px', fontSize: '11px', whiteSpace: 'normal', height: 'auto', padding: '8px'}}>
                {optimization?.regions?.danang?.message}
              </div>
              <textarea 
                className="input-field" 
                style={{width: '100%', minHeight: '150px'}}
                value={optimization?.regions?.danang?.recipe || ''}
                readOnly
              />
            </div>

            {/* HCM */}
            <div style={{gridColumn: 'span 4'}} className="glass-card region-card">
              <h3 className="text-body-md" style={{fontWeight: 'bold', marginBottom: '16px'}}>🌴 Chi Nhánh TP.HCM</h3>
              <div className="chip" style={{background: 'rgba(244, 114, 182, 0.15)', color: 'var(--accent-pink)', marginBottom: '16px', fontSize: '11px', whiteSpace: 'normal', height: 'auto', padding: '8px'}}>
                {optimization?.regions?.hcm?.message}
              </div>
              <textarea 
                className="input-field" 
                style={{width: '100%', minHeight: '150px'}}
                value={optimization?.regions?.hcm?.recipe || ''}
                readOnly
              />
            </div>
          </div>
        )}
      </main>

      <style>{`
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
        .region-card {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
