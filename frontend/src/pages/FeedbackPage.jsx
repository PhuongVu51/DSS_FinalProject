import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FeedbackPage() {
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [feedback, setFeedback] = useState([]);
  const [optimization, setOptimization] = useState(null);
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
    let url = `http://localhost:8000/api/feedback/${encodeURIComponent(selectedCake)}`;
    if (selectedRegion && selectedRegion !== 'All') {
      url += `?region=${encodeURIComponent(selectedRegion)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setFeedback(data.stats || []);
      })
      .catch(err => {
        console.error("Error fetching feedback:", err);
      });

    // Also fetch optimization data for formulas
    fetch(`http://localhost:8000/api/recipes/${encodeURIComponent(selectedCake)}/optimize`)
      .then(res => res.json())
      .then(data => {
        setOptimization(data);
      })
      .catch(err => console.error("Error fetching optimization:", err));
  }, [selectedCake, selectedRegion]);

  if (!user) return null;

  // Calculate totals and max for chart height
  const totalFeedback = feedback.reduce((acc, curr) => acc + curr.count, 0);
  const maxFeedback = Math.max(...feedback.map(f => f.count), 1);
  const goodFeedback = feedback.filter(f => parseInt(f.score) === 3).reduce((acc, curr) => acc + curr.count, 0);
  const sweetFeedback = feedback.filter(f => parseInt(f.score) > 3).reduce((acc, curr) => acc + curr.count, 0);
  const blandFeedback = feedback.filter(f => parseInt(f.score) < 3).reduce((acc, curr) => acc + curr.count, 0);
  const positiveRatio = totalFeedback > 0 ? Math.round((goodFeedback / totalFeedback) * 100) : 0;
  const sweetRatio = totalFeedback > 0 ? Math.round((sweetFeedback / totalFeedback) * 100) : 0;
  const blandRatio = totalFeedback > 0 ? Math.round((blandFeedback / totalFeedback) * 100) : 0;

  return (
    <div className="feedback-page">
      <header className="header">
        <div className="header-left">
          <span className="logo">R&D OS</span>
          <nav className="nav-links">
            <a href="/" >Landing</a>
            <a href="/formula" >Formula Declaration</a>
            <a href="/feedback" className="active">Feedback Monitor</a>
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
          <h1 className="text-headline-lg" style={{marginBottom: '8px'}}>2. Trung tâm giám sát Phản hồi thực tế từ Database</h1>
          <p className="text-body-md text-secondary">Real-time feedback monitoring and automated DSS decision logic.</p>
        </div>

        <div className="glass-card" style={{marginBottom: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
          <div style={{flex: '1', minWidth: '300px'}}>
            <label className="input-label" style={{marginBottom: '8px'}}>Chọn sản phẩm bánh cần kiểm tra:</label>
            <select 
              className="input-field" 
              style={{width: '100%'}}
              value={selectedCake}
              onChange={(e) => setSelectedCake(e.target.value)}
            >
              {cakes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div style={{flex: '1', minWidth: '300px'}}>
            <label className="input-label" style={{marginBottom: '8px'}}>Khu vực / Thành phố:</label>
            <select 
              className="input-field" 
              style={{width: '100%'}}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="All">Tất cả khu vực (Toàn quốc)</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            </select>
          </div>
        </div>

        <div className="grid-12">
          {/* Chart Section */}
          <section className="glass-card" style={{gridColumn: 'span 8', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
              <h2 className="text-headline-sm">Biểu đồ phân bổ độ ngọt</h2>
              <div style={{display: 'flex', gap: '8px'}}>
                <span style={{fontSize: '12px', color: 'var(--accent-cyan)'}}>● Độ ngọt</span>
              </div>
            </div>

            <div className="chart-container">
              {totalFeedback === 0 ? (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>
                  🔄 Chưa ghi nhận lượt đánh giá phản hồi nào từ người dùng cho sản phẩm này.
                </div>
              ) : (
                <>
                  {/* Scores 1 to 5 mapping */}
                  {[1, 2, 3, 4, 5].map(score => {
                    const dataPoint = feedback.find(f => parseInt(f.score) === score);
                    const count = dataPoint ? dataPoint.count : 0;
                    const heightPercentage = Math.max((count / maxFeedback) * 100, 5); // at least 5% so it's visible
                    const SCORE_LABELS = {
                      1: 'Nhạt',
                      2: 'Hơi nhạt',
                      3: 'Vừa',
                      4: 'Ngọt',
                      5: 'Rất ngọt'
                    };
                    
                    return (
                      <div key={score} className="chart-bar-wrapper">
                        <div 
                          className="chart-bar-cyan" 
                          style={{height: heightPercentage + '%'}}
                          title={SCORE_LABELS[score] + ': ' + count + ' votes'}
                        ></div>
                        <span className="chart-label">{SCORE_LABELS[score]}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <p className="stat-label">Độ hài lòng (Vừa phải)</p>
                <p className="stat-value text-tertiary">{positiveRatio}%</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Response Rate</p>
                <p className="stat-value text-secondary">92%</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Total Samples</p>
                <p className="stat-value" style={{color: 'var(--text-primary)'}}>{totalFeedback}</p>
              </div>
            </div>
          </section>

          {/* DSS Recommendation Panel */}
          <section className="glass-card" style={{gridColumn: 'span 4', display: 'flex', flexDirection: 'column'}}>
            <h2 className="text-headline-sm" style={{marginBottom: '24px'}}>QUYẾT ĐỊNH TỪ DSS</h2>
            <p className="text-body-sm text-secondary" style={{marginBottom: '24px'}}>Hệ thống hỗ trợ ra quyết định phân tích từ dữ liệu Feedback thực tế.</p>
            
            <div className="dss-box">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <span className="text-body-md" style={{fontWeight: 'bold', color: 'var(--accent-cyan)'}}>Kết luận:</span>
                <span className="chip chip-cyan" style={{fontSize: '10px'}}>Đã phân tích</span>
              </div>
              <p className="text-body-sm" style={{lineHeight: 1.6}}>
                Dựa trên {totalFeedback} mẫu phản hồi mới nhất, hệ thống DSS xác định công thức hiện tại 
                {positiveRatio > 50 ? ' đạt tỷ lệ hài lòng cao.' : (sweetRatio > blandRatio ? ' có xu hướng quá ngọt.' : ' có xu hướng hơi nhạt.')}
                <br/><br/>
                <span style={{color: 'var(--accent-pink)', fontWeight: 'bold'}}>Khuyến nghị: </span>
                {selectedRegion === 'Hà Nội' 
                  ? 'Giảm 15% lượng đường để phù hợp thị hiếu ăn nhạt của Hà Nội.' 
                  : selectedRegion === 'TP. Hồ Chí Minh' 
                  ? 'Tăng 8% lượng đường để phù hợp thị hiếu đậm vị của TP. Hồ Chí Minh.' 
                  : selectedRegion === 'Đà Nẵng' 
                  ? 'Giữ nguyên lượng đường để phù hợp với vị cân bằng của Đà Nẵng.' 
                  : (positiveRatio > 50 ? 'Giữ nguyên cấu trúc.' : (sweetRatio > blandRatio ? 'Giảm 10-15% lượng đường/béo để cân bằng vị giác.' : 'Tăng 5-10% lượng đường/béo để phù hợp thị hiếu.'))}
              </p>

              {/* Display Adjusted Formula if a Region is Selected */}
              {(selectedRegion !== 'All' && optimization) && (
                <div style={{marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent-pink)'}}>
                  <span style={{color: 'var(--accent-pink)', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Khuyến nghị công thức:</span>
                  <pre style={{fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0}}>
                    {selectedRegion === 'Hà Nội' ? optimization?.regions?.hanoi?.recipe : 
                     selectedRegion === 'TP. Hồ Chí Minh' ? optimization?.regions?.hcm?.recipe : 
                     selectedRegion === 'Đà Nẵng' ? optimization?.regions?.danang?.recipe : 
                     optimization?.original || 'Đang tải...'}
                  </pre>
                </div>
              )}
            </div>

            <div style={{marginTop: 'auto', paddingTop: '24px'}}>
              <button className="btn btn-primary" style={{width: '100%', padding: '12px'}}>Phê duyệt DSS</button>
            </div>
          </section>
        </div>
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
        .text-tertiary { color: var(--accent-cyan); }
        .text-secondary { color: var(--text-secondary); }
        
        .chart-container {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          gap: 16px;
          min-height: 250px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 8px;
        }
        .chart-bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 50px;
          height: 100%;
          justify-content: flex-end;
        }
        .chart-bar-pink {
          background: linear-gradient(180deg, var(--accent-pink) 0%, var(--accent-pink-dark) 100%);
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
        .chart-bar-cyan {
          background: linear-gradient(180deg, var(--accent-cyan) 0%, rgba(34, 211, 238, 0.4) 100%);
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
        .chart-bar-pink:hover, .chart-bar-cyan:hover {
          filter: brightness(1.2);
        }
        .chart-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-secondary);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 24px;
        }
        .stat-box {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 4px;
        }
        
        .dss-box {
          background: rgba(34, 211, 238, 0.05);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: var(--radius-md);
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
