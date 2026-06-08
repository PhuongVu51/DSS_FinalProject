import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const RATINGS = [
  { emoji: '🧊', label: 'Nhạt', value: 1 },
  { emoji: '🍃', label: 'Vừa', value: 2 },
  { emoji: '🍯', label: 'Lý Tưởng', value: 3 },
  { emoji: '🔥', label: 'Đậm', value: 4 },
  { emoji: '🍭', label: 'Rất Ngọt', value: 5 },
];

const RECOMMENDATIONS = [
  { name: 'Oreo Brownie Mochi', price: '35,000 VND', emoji: '🍫', desc: 'Sự kết hợp hoàn hảo giữa vỏ bánh mochi dẻo mịn và nhân brownie đậm đà.', featured: true },
  { name: 'Trà Ô Long Kem Phô Mai', price: '45,000 VND', emoji: '🍵', desc: 'Vị chát nhẹ của trà sẽ cân bằng độ ngọt của bánh Mochi Nhân Kem.', featured: false },
  { name: 'Cookies Matcha Macadamia', price: '28,000 VND', emoji: '🍪', desc: 'Hương vị thanh tao từ bột Matcha Nhật Bản thượng hạng.', featured: false },
];

export default function CustomerExperiencePage() {
  const [selectedRating, setSelectedRating] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState('');
  const [region, setRegion] = useState('Hà Nội');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/recipes')
      .then(r => r.json()).then(d => { setCakes(d); if (d.length > 0) setSelectedCake(d[0]); })
      .catch(console.error);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCake) {
      alert("Please select a product first");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: selectedCake,
          customer_name: user.fullname,
          region: region,
          score: selectedRating
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert("Error: " + data.detail);
      }
    } catch (err) {
      alert("Failed to connect to the server.");
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '256px' }}>
        <TopBar />
        <main style={{ padding: '88px 40px 40px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '999px', padding: '4px 12px', marginBottom: '16px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              <span className="text-label-mono" style={{ color: 'var(--accent-cyan)' }}>LIVE EXPERIENCE TRACKER</span>
            </div>
            <h1 className="text-headline-lg">KHU VỰC DÀNH CHO NGƯỜI TRẢI NGHIỆM SẢN PHẨM</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', marginBottom: '40px' }}>
            {/* Left: The Form */}
            <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-pink-dark))' }}></div>
              <h2 className="text-headline-sm" style={{ color: 'var(--accent-pink)', marginBottom: '8px' }}>Phiếu Đánh giá Trải nghiệm Khẩu vị</h2>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Vui lòng cung cấp phản hồi chính xác để tối ưu hóa công thức sản phẩm.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">KHÁCH HÀNG</label>
                    <input className="input-field" value={user.fullname} readOnly style={{ opacity: 0.7 }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">KHU VỰC / THÀNH PHỐ</label>
                    <select className="input-field" value={region} onChange={e => setRegion(e.target.value)}>
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                      <option>Đà Nẵng</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">SẢN PHẨM ĐANG TRẢI NGHIỆM</label>
                  <select className="input-field" value={selectedCake} onChange={e => setSelectedCake(e.target.value)}>
                    {cakes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Rating Scale */}
                <div>
                  <label className="input-label" style={{ display: 'block', textAlign: 'center', marginBottom: '12px' }}>MỨC ĐỘ NGỌT (SWEETNESS INTENSITY)</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                    {RATINGS.map((r, i) => (
                      <React.Fragment key={r.value}>
                        <button type="button" onClick={() => setSelectedRating(r.value)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '8px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s', transform: selectedRating === r.value ? 'scale(1.25)' : 'scale(1)' }}>
                          <span style={{ fontSize: '28px', filter: selectedRating === r.value ? 'none' : 'grayscale(80%)' }}>{r.emoji}</span>
                          <span className="text-label-mono" style={{ color: selectedRating === r.value ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '10px' }}>{r.label.toUpperCase()}</span>
                        </button>
                        {i < RATINGS.length - 1 && <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)', margin: '0 4px' }}></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: '15px', background: submitted ? '#10B981' : undefined }}>
                  {submitted ? '✅ Gửi Thành Công!' : 'Gửi Đánh Giá Trải Nghiệm'}
                </button>
              </form>
            </div>

            {/* Right: Visual */}
            <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', minHeight: '400px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(244,114,182,0.15) 0%, rgba(34,211,238,0.1) 50%, rgba(5,20,36,0.9) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '120px' }}>🍰</div>
              <div style={{ position: 'relative', padding: '32px' }}>
                <h3 className="text-headline-sm" style={{ color: 'white', marginBottom: '8px' }}>Phân tích Thị trường Thời gian thực</h3>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Hệ thống đang xử lý dữ liệu từ 150+ điểm trải nghiệm để đưa ra đề xuất tối ưu nhất.</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
            <h2 className="text-headline-sm" style={{ color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>✨ Gợi ý mua sắm đi kèm dành riêng cho bạn</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {RECOMMENDATIONS.map(rec => (
              <div key={rec.name} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', border: rec.featured ? '1px solid rgba(34,211,238,0.3)' : undefined, transition: 'transform 0.3s', cursor: 'pointer' }}>
                <div style={{ aspectRatio: '4/3', background: `linear-gradient(135deg, rgba(244,114,182,0.15), rgba(34,211,238,0.1))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', borderBottom: '1px solid var(--border-glass)' }}>
                  {rec.emoji}
                </div>
                <div style={{ padding: '20px' }}>
                  {rec.featured && <span className="chip chip-cyan" style={{ fontSize: '10px', marginBottom: '12px', display: 'inline-block' }}>Sản phẩm khuyên dùng kèm lý tưởng</span>}
                  <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{rec.name}</h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{rec.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{rec.price}</span>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', border: '1px solid var(--border-glass)', fontSize: '20px' }}>🛍️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Insight */}
          <div style={{ marginTop: '32px', background: 'rgba(12,33,49,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(34,211,238,0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>💡</div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Data Insight for Recommendation</p>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Dựa trên 85% phản hồi từ khách hàng cùng độ tuổi và khẩu vị tại {region}, việc kết hợp sản phẩm có vị đắng nhẹ (Oreo/Matcha) với sản phẩm có kem tươi sẽ làm tăng mức độ hài lòng tổng thể lên <strong style={{ color: 'var(--accent-cyan)' }}>2.4 lần</strong>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
