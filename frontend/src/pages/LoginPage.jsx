import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        login(data); // Store via AuthContext
        
        // Role-based redirect
        const isAdmin = data.role?.includes('Nhà Sản Xuất');
        const from = location.state?.from?.pathname;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
        } else {
          navigate(isAdmin ? '/formula-decl' : '/experience', { replace: true });
        }
      } else {
        setError(data.detail || 'Invalid username or password');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="login-page">
      <div className="glass-card login-card">
        <h2 className="text-headline-lg" style={{color: 'white', marginBottom: '8px'}}>Jolista System</h2>
        <p className="text-body-sm" style={{color: 'var(--accent-cyan)', marginBottom: '32px'}}>Hệ Hỗ Trợ Ra Quyết Định R&D Menu Bánh</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Tài khoản</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nhập mã nhân viên..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{marginTop: '16px', padding: '12px'}}>
            XÁC NHẬN ĐĂNG NHẬP
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-primary);
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(244, 114, 182, 0.15) 0%, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px 30px;
          text-align: center;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }
        .error-message {
          background: rgba(255, 180, 171, 0.1);
          color: #ffb4ab;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 180, 171, 0.3);
        }
      `}</style>
    </div>
  );
}
