import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { key: 'formula-decl', path: '/formula-decl', label: 'Formula Declaration', icon: '⚗️' },
  { key: 'feedback',     path: '/feedback',      label: 'Feedback Monitor',    icon: '📊' },
  { key: 'experience',   path: '/experience',    label: 'Customer Surveys',    icon: '📝' },
  { key: 'new-product',  path: '/new-product',   label: 'Create New Product',  icon: '➕' },
];

const CUSTOMER_NAV = [
  { key: 'experience', path: '/experience', label: 'Taste Surveys', icon: '📝' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = isAdmin ? ADMIN_NAV : CUSTOMER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 60,
      background: 'rgba(13, 28, 45, 0.7)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', padding: '32px 0'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h1 className="text-headline-sm" style={{ color: 'var(--accent-pink)', fontWeight: 900, letterSpacing: '-0.5px' }}>R&D OS</h1>
        <p className="text-label-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px', marginTop: '4px' }}>
          {isAdmin ? 'PRODUCER / OWNER CONSOLE' : 'CUSTOMER CONSOLE'}
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.key} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderRight: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 400, fontSize: '14px',
              textAlign: 'left', transition: 'all 0.2s', width: '100%',
              fontFamily: 'var(--font-sans)',
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin-only action */}
      {isAdmin && (
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <button onClick={() => navigate('/new-product')} className="btn btn-secondary"
            style={{ width: '100%', padding: '10px', justifyContent: 'center', gap: '6px' }}>
            ➕ New Declaration
          </button>
        </div>
      )}

      {/* User info + Logout */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {user && (
          <div style={{ marginBottom: '12px' }}>
            <p className="text-body-sm" style={{ color: 'white', fontWeight: 600 }}>{user.fullname}</p>
            <p className="text-label-mono" style={{ color: isAdmin ? 'var(--accent-pink)' : 'var(--accent-cyan)', fontSize: '10px', marginTop: '2px' }}>
              {isAdmin ? '🏭 Nhà Sản Xuất' : '😋 Người Trải Nghiệm'}
            </p>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
          color: 'var(--text-secondary)', background: 'transparent', border: 'none',
          cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s',
          fontFamily: 'var(--font-sans)',
        }}>
          🚪 <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
