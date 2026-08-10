import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('AdminJN');
  const [password, setPassword] = useState('Password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSubmitting(true);
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0c0a09',
      backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(217, 119, 6, 0.45) 0%, rgba(120, 53, 15, 0.25) 35%, rgba(12, 10, 9, 1) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* Central Split Card Container */}
      <div style={{
        width: '1000px',
        maxWidth: '95vw',
        minHeight: '580px',
        backgroundColor: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.75)',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative'
      }}>
        {/* LEFT PANEL: Form Controls (Clean White Minimalist) */}
        <div style={{
          width: '400px',
          minWidth: '340px',
          padding: '40px 36px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 2
        }}>
          {/* Top Brand Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div style={{
                backgroundColor: '#0b1329',
                borderRadius: '14px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)'
              }}>
                <img 
                  src="/Logo.png" 
                  alt="JN Ceylon Logo" 
                  style={{ height: '36px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.3) contrast(1.2)' }} 
                  onError={(e) => { e.target.src = '/logo.png'; }} 
                />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  JN CEYLON
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '2px' }}>
                  PRODUCTS ERP
                </div>
              </div>
            </div>

            {/* Central Avatar Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)'
              }}>
                <User size={38} strokeWidth={1.8} />
              </div>
            </div>

            {/* Error Feedback Alert */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username Input Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #1e293b',
                borderRadius: '30px',
                padding: '0 16px',
                height: '48px',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s'
              }}>
                <User size={18} style={{ color: '#0f172a', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0f172a',
                    letterSpacing: '0.5px',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Password Input Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #1e293b',
                borderRadius: '30px',
                padding: '0 16px',
                height: '48px',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s'
              }}>
                <Lock size={18} style={{ color: '#0f172a', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0f172a',
                    letterSpacing: '0.5px',
                    background: 'transparent'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Submit Pill Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: '48px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: '800',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.3)',
                  transition: 'transform 0.1s, background-color 0.2s'
                }}
              >
                {submitting ? 'Authenticating...' : 'Login'}
              </button>

              {/* Checkbox & Links */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#0f172a', cursor: 'pointer' }}
                  />
                  <span>Remember me</span>
                </label>
                <span style={{ cursor: 'pointer', color: '#0f172a', fontWeight: '600' }} onClick={() => setError('Contact Admin for password resets.')}>
                  Forgot password?
                </span>
              </div>
            </form>
          </div>

          {/* Bottom Footer Dots */}
          <div style={{ textAlign: 'center', color: '#0f172a', fontSize: '22px', letterSpacing: '4px', marginTop: '16px' }}>
            •••
          </div>
        </div>

        {/* RIGHT PANEL: Hero Liquid Gold Wallpaper & Welcome Banner */}
        <div style={{
          flex: 1,
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.65)), url('/login_hero_bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative'
        }}>
          {/* Top Right Simulated Header Nav */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>SYSTEM</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>DOCUMENTATION</span>
            <span style={{
              backgroundColor: '#f59e0b',
              color: '#000000',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '700'
            }}>
              ONLINE
            </span>
          </div>

          {/* Bottom Left Hero Welcome */}
          <div>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '800',
              margin: '0 0 12px 0',
              color: '#ffffff',
              letterSpacing: '-1.5px',
              lineHeight: 1.05
            }}>
              Welcome.
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '380px',
              margin: '0 0 24px 0',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              JN Ceylon Products official accounting & document management portal. Secure access for authorized personnel only.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#fef3c7',
              fontWeight: '600'
            }}>
              <ShieldCheck size={16} style={{ color: '#f59e0b' }} />
              Authorized Personnel Portal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
