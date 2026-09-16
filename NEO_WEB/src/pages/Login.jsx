// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  RiUserLine, 
  RiLockPasswordLine, 
  RiEyeLine, 
  RiEyeOffLine, 
  RiErrorWarningLine,
  RiShieldCheckLine,
  RiUserHeartLine,
  RiStethoscopeLine,
  RiBarcodeBoxLine,
  RiSparklingLine
} from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';
import neoLogo from '../assets/neo-logo.png';

const Login = () => {
  const [loginType, setLoginType] = useState('patient'); // 'patient' | 'staff'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: 'P10025', password: 'password123' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard or patient portal
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleTabSwitch = (type) => {
    setLoginType(type);
    setError('');
    if (type === 'patient') {
      setForm({ email: 'P10025', password: 'password123' });
    } else {
      setForm({ email: 'doctor@hospital.com', password: 'password123' });
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setError(loginType === 'patient' ? 'Please enter your Patient ID or email & password.' : 'Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          {/* Main Logo Card */}
          <div className="login-hero-logo-card">
            <img 
              src={neoLogo} 
              alt="NEO Care Hospital Logo" 
              className="login-hero-logo-img" 
            />
          </div>

          {/* Clean Healthcare Branding Text */}
          <div className="login-hero-text">
            <h1 className="login-hero-title">
              Smart Hospital Management &amp; Patient Portal
            </h1>
            <p className="login-hero-subtitle">
              Unified digital healthcare platform for patient health tracking, treatment traceability, 
              lab diagnostic reports, and hospital operations.
            </p>
          </div>

          {/* Healthcare Features List */}
          <div className="login-hero-features">
            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <span>Patient Portal — Access Records by Patient ID</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <span>Real-Time Treatment Progress &amp; Traceability</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <span>View-Only Health Records &amp; Diagnostic Reports</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <span>Book Appointments &amp; Submit Care Inquiries</span>
            </div>
          </div>

          {/* System Badge */}
          <div className="login-hero-badge">
            <RiShieldCheckLine size={16} />
            <span>Official Enterprise Healthcare Platform</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header" style={{ marginBottom: '16px' }}>
            <h2 className="login-card-title">Welcome to NEO Care</h2>
            <p className="login-card-subtitle">Select your login portal to access your health portal or staff account</p>
          </div>

          {/* Portal Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '4px',
            background: 'var(--color-surface-alt, #F1F5F9)',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => handleTabSwitch('patient')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: loginType === 'patient' ? '#FFFFFF' : 'transparent',
                color: loginType === 'patient' ? 'var(--color-primary, #2563EB)' : '#64748B',
                boxShadow: loginType === 'patient' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <RiUserHeartLine size={16} />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('staff')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: loginType === 'staff' ? '#FFFFFF' : 'transparent',
                color: loginType === 'staff' ? 'var(--color-primary, #2563EB)' : '#64748B',
                boxShadow: loginType === 'staff' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <RiStethoscopeLine size={16} />
              <span>Staff Login</span>
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#991B1B',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <RiErrorWarningLine size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                {loginType === 'patient' ? 'Patient ID or Email' : 'Staff Email Address'}
              </label>
              <div className="search-input-wrap">
                {loginType === 'patient' ? <RiBarcodeBoxLine className="search-icon" size={16} /> : <RiUserLine className="search-icon" size={16} />}
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  className="form-input"
                  placeholder={loginType === 'patient' ? 'e.g. P10025 or P10041' : 'admin@hospital.com'}
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="form-label">Password</label>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '0', height: 'auto', fontSize: '12px', color: 'var(--color-primary)' }}>
                  Need help logging in?
                </button>
              </div>
              <div className="search-input-wrap">
                <RiLockPasswordLine className="search-icon" size={16} />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="search-clear-btn"
                  style={{ right: '10px', color: '#94A3B8', fontSize: '16px' }}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full btn-lg"
              style={{ marginTop: '8px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Authenticating...
                </>
              ) : (
                loginType === 'patient' ? 'Access Patient Portal' : 'Sign In as Staff'
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div style={{ marginTop: '20px', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
            <div style={{ fontWeight: '600', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RiSparklingLine style={{ color: '#2563EB' }} /> Quick Demo Access:
            </div>
            {loginType === 'patient' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'P10025', password: 'password123' })}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Patient P10025 (Arun)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'P10041', password: 'password123' })}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Patient P10041 (Meena)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'admin@hospital.com', password: 'password123' })}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'doctor@hospital.com', password: 'password123' })}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'reception@hospital.com', password: 'password123' })}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Receptionist
                </button>
              </div>
            )}
          </div>

          <p className="login-footer-note" style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#94A3B8' }}>
            Encrypted &amp; HIPAA Compliant Healthcare System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
