import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FeedbackPage() {
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [feedback, setFeedback] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [trending, setTrending] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [comboStats, setComboStats] = useState([]);
  const [regionalComparison, setRegionalComparison] = useState([]);
  const [experimentalPerformance, setExperimentalPerformance] = useState([]);
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

    // Fetch experimental performance (global)
    fetch('http://localhost:8000/api/experimental_performance')
      .then(res => res.json()).then(setExperimentalPerformance).catch(console.error);
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

    // Fetch optimization data for formulas
    fetch(`http://localhost:8000/api/recipes/${encodeURIComponent(selectedCake)}/optimize`)
      .then(res => res.json())
      .then(data => {
        setOptimization(data);
      })
      .catch(err => console.error("Error fetching optimization:", err));
      
    // Fetch heatmap data
    fetch(`http://localhost:8000/api/feedback/${encodeURIComponent(selectedCake)}/heatmap`)
      .then(res => res.json())
      .then(data => setHeatmapData(data))
      .catch(err => console.error("Error fetching heatmap:", err));

    // Fetch trending buys based on region
    let trendingUrl = 'http://localhost:8000/api/trending';
    if (selectedRegion && selectedRegion !== 'All') {
      trendingUrl += `?region=${encodeURIComponent(selectedRegion)}`;
    }
    fetch(trendingUrl)
      .then(res => res.json())
      .then(data => setTrending(data))
      .catch(err => console.error("Error fetching trending:", err));

    // Fetch combo stats based on region
    let comboUrl = 'http://localhost:8000/api/combo_stats';
    if (selectedRegion && selectedRegion !== 'All') {
      comboUrl += `?region=${encodeURIComponent(selectedRegion)}`;
    }
    fetch(comboUrl)
      .then(res => res.json())
      .then(setComboStats)
      .catch(err => console.error("Error fetching combo stats:", err));

    // Fetch regional comparison for the selected cake
    fetch(`http://localhost:8000/api/regional_comparison/${encodeURIComponent(selectedCake)}`)
      .then(res => res.json())
      .then(setRegionalComparison)
      .catch(err => console.error("Error fetching regional comparison:", err));
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

  const isAdmin = user && user.role && (user.role.includes('Nhà Sản Xuất') || user.role.includes('admin'));

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

        {isAdmin && (
          <div className="grid-12" style={{marginBottom: '32px'}}>
            {/* Top Selling Products */}
            <section className="glass-card" style={{gridColumn: 'span 6', display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px'}}>
                <h2 className="text-headline-sm" style={{color: 'var(--accent-pink)'}}>🔥 Top Selling Products</h2>
                <span className="chip chip-cyan" style={{fontSize: '10px'}}>{selectedRegion !== 'All' ? `tại ${selectedRegion}` : 'Toàn quốc'}</span>
              </div>
              {trending.length === 0 ? (
                <p className="text-body-md text-secondary">Không có dữ liệu mua hàng cho khu vực này...</p>
              ) : (
                <div style={{display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px'}}>
                  {trending.map((item, index) => (
                    <div key={item.product} style={{minWidth: '180px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column'}}>
                      <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '8px'}}>#{index + 1}</div>
                      <div className="text-headline-sm" style={{marginBottom: '4px', fontSize: '15px'}}>{item.product}</div>
                      <div className="text-body-sm text-secondary" style={{marginBottom: '12px'}}>{item.buys} lượt phản hồi/mua</div>
                      {item.bought_with && (
                        <div style={{marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed var(--border-glass)'}}>
                          <div style={{fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Thường mua cùng</div>
                          <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--accent-pink)'}}>{item.bought_with}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Combo Stats */}
            <section className="glass-card" style={{gridColumn: 'span 6', display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px'}}>
                <h2 className="text-headline-sm" style={{color: 'var(--accent-cyan)'}}>🤝 Combo Recommendations</h2>
                <span className="chip chip-pink" style={{fontSize: '10px'}}>Cross-sell Analysis</span>
              </div>
              {comboStats.length === 0 ? (
                <p className="text-body-md text-secondary">Không có dữ liệu combo...</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto'}}>
                  {comboStats.map((item, index) => (
                    <div key={item.pair} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <span style={{color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold'}}>#{index + 1}</span>
                        <span style={{fontWeight: 600, fontSize: '14px'}}>{item.pair}</span>
                      </div>
                      <span className="text-tertiary" style={{fontWeight: 'bold', fontSize: '13px'}}>{item.count} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="grid-12" style={{marginBottom: '32px'}}>
          {/* Chart Section */}
          <section className="glass-card" style={{gridColumn: 'span 5', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
              <h2 className="text-headline-sm">Phân bổ độ ngọt</h2>
              <div style={{display: 'flex', gap: '8px'}}>
                <span style={{fontSize: '12px', color: 'var(--accent-cyan)'}}>● Độ ngọt</span>
              </div>
            </div>

            <div className="chart-container">
              {totalFeedback === 0 ? (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>
                  🔄 Chưa có dữ liệu
                </div>
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map(score => {
                    const dataPoint = feedback.find(f => parseInt(f.score) === score);
                    const count = dataPoint ? dataPoint.count : 0;
                    const heightPercentage = Math.max((count / maxFeedback) * 100, 5); 
                    const SCORE_LABELS = { 1: 'Nhạt', 2: 'Hơi nhạt', 3: 'Vừa', 4: 'Ngọt', 5: 'Rất ngọt' };
                    
                    return (
                      <div key={score} className="chart-bar-wrapper">
                        <div className="chart-bar-cyan" style={{height: heightPercentage + '%'}} title={SCORE_LABELS[score] + ': ' + count + ' votes'}></div>
                        <span className="chart-label">{SCORE_LABELS[score]}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <p className="stat-label">Độ hài lòng</p>
                <p className="stat-value text-tertiary">{positiveRatio}%</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Total Samples</p>
                <p className="stat-value" style={{color: 'var(--text-primary)'}}>{totalFeedback}</p>
              </div>
            </div>
          </section>

          {/* Regional Comparison Chart */}
          <section className="glass-card" style={{gridColumn: 'span 3', display: 'flex', flexDirection: 'column'}}>
            <h2 className="text-headline-sm" style={{marginBottom: '24px'}}>Thị phần Vùng miền</h2>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center'}}>
              {regionalComparison.length === 0 || regionalComparison.every(r => r.count === 0) ? (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Không có dữ liệu</div>
              ) : (
                regionalComparison.map(r => {
                  const total = regionalComparison.reduce((sum, item) => sum + item.count, 0);
                  const percent = total > 0 ? Math.round((r.count / total) * 100) : 0;
                  return (
                    <div key={r.region}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px'}}>
                        <span>{r.region}</span>
                        <span style={{color: 'var(--accent-pink)', fontWeight: 'bold'}}>{percent}% ({r.count})</span>
                      </div>
                      <div style={{width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-pink-dark))'}}></div>
                      </div>
                    </div>
                  );
                })
              )}
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

        {isAdmin && (
          <div className="grid-12" style={{marginTop: '32px'}}>
            {/* Heatmap Section */}
            {heatmapData && (
              <section className="glass-card" style={{gridColumn: 'span 7'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h2 className="text-headline-sm">Bản đồ Nhiệt Phân bố Khẩu vị (Heatmap)</h2>
                  <span className="chip chip-pink" style={{fontSize: '10px'}}>So sánh Vùng miền</span>
                </div>
                
                {(() => {
                  const regions = ["Hà Nội", "Đà Nẵng", "TP.HCM"];
                  const scores = [1, 2, 3, 4, 5];
                  const SCORE_LABELS = { 1: 'Nhạt (1)', 2: 'Hơi nhạt (2)', 3: 'Vừa (3)', 4: 'Ngọt (4)', 5: 'Rất ngọt (5)' };
                  
                  let maxCount = 1;
                  regions.forEach(r => {
                    scores.forEach(s => {
                      if (heatmapData[r] && heatmapData[r][s] > maxCount) {
                        maxCount = heatmapData[r][s];
                      }
                    });
                  });

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: '8px', alignItems: 'center' }}>
                      {/* Header */}
                      <div></div>
                      {scores.map(s => <div key={s} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{SCORE_LABELS[s]}</div>)}
                      
                      {/* Rows */}
                      {regions.map(r => (
                        <React.Fragment key={r}>
                          <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--accent-cyan)' }}>{r}</div>
                          {scores.map(s => {
                            const count = heatmapData[r] ? (heatmapData[r][s] || 0) : 0;
                            const intensity = count / maxCount;
                            return (
                              <div key={`${r}-${s}`} style={{
                                height: '40px',
                                background: count > 0 ? `rgba(244, 114, 182, ${Math.max(0.15, intensity)})` : 'rgba(255,255,255,0.02)',
                                border: count > 0 ? '1px solid rgba(244, 114, 182, 0.4)' : '1px dashed var(--border-glass)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: count > 0 ? 'bold' : 'normal',
                                color: count > 0 ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                              }} title={`${r} - ${SCORE_LABELS[s]}: ${count} đánh giá`}>
                                {count > 0 ? count : '-'}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Experimental Performance */}
            <section className="glass-card" style={{gridColumn: 'span 5', display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h2 className="text-headline-sm" style={{color: 'white'}}>R&D Experimental Pipeline</h2>
                <span className="chip chip-cyan" style={{fontSize: '10px'}}>Low Volume / New</span>
              </div>
              
              {experimentalPerformance.length === 0 ? (
                <p className="text-body-md text-secondary">Không có sản phẩm thử nghiệm...</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '250px'}}>
                  {experimentalPerformance.slice(0, 5).map(item => (
                    <div key={item.product} style={{padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: item.status === 'Hài Lòng' ? '4px solid #10B981' : '4px solid var(--accent-pink)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{fontWeight: 'bold', fontSize: '14px'}}>{item.product}</span>
                        <span style={{color: item.status === 'Hài Lòng' ? '#10B981' : 'var(--accent-pink)', fontSize: '12px', fontWeight: 'bold'}}>{item.status}</span>
                      </div>
                      <div style={{display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)'}}>
                        <span>⭐ Avg Score: <strong style={{color: 'white'}}>{item.avg_score}</strong></span>
                        <span>📊 Samples: <strong style={{color: 'white'}}>{item.count}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
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
