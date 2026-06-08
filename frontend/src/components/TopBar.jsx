import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, left: '256px', height: '64px', zIndex: 50,
      background: 'rgba(5,20,36,0.8)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span className="text-headline-sm" style={{ color: 'var(--accent-pink)', fontWeight: 900 }}>R&D Management System</span>
        {isAdmin && (
          <nav style={{ display: 'flex', gap: '20px' }}>
            {[
              ['/formula-decl', 'Formula'],
              ['/feedback',     'Feedback'],
              ['/experience',   'Surveys'],
              ['/new-product',  'New Product'],
            ].map(([path, label]) => (
              <button key={path} onClick={() => navigate(path)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px', transition: 'color 0.2s', fontFamily: 'var(--font-sans)' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAdmin && (
          <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>Deploy</button>
        )}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--border-glass)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: isAdmin ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-pink-dark))' : 'linear-gradient(135deg, var(--accent-cyan), #0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              {isAdmin ? '🏭' : '😋'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.fullname?.split(' ').pop()}</span>
          </div>
        )}
      </div>
    </header>
  );
}
