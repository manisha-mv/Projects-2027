// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiHeartPulseLine, RiUserLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiErrorWarningLine } from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(form.email, form.password);
      // Navigation is handled by the useEffect above
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <RiHeartPulseLine size={28} />
          </div>
          <div>
            <h1 className="login-brand-name">NEO-HMS</h1>
            <p className="login-brand-tagline">Hospital Management System</p>
          </div>
        </div>

        <div className="login-hero-content">
          <h2 className="login-hero-title">
            Smart Integrated<br />Hospital Management
          </h2>
          <p className="login-hero-subtitle">
            A unified platform for clinical, administrative,
            and operational excellence in healthcare.
          </p>

          <div className="login-features">
            {[
              'Patient & Clinical Records',
              'Laboratory & Radiology',
              'Billing & Insurance',
              'Emergency & Surgery',
            ].map(f => (
              <div key={f} className="login-feature-item">
                <span className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign in to your account</h2>
            <p className="login-card-subtitle">Enter your credentials to access the system</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--color-error-light)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error-dark)',
                fontSize: '13px',
                marginBottom: 'var(--space-4)'
              }}>
                <RiErrorWarningLine size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email address
              </label>
              <div className="search-input-wrap">
                <RiUserLine className="search-icon" size={15} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="admin@hospital.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="form-label">Password</label>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '0', height: 'auto', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                  Forgot password?
                </button>
              </div>
              <div className="search-input-wrap">
                <RiLockPasswordLine className="search-icon" size={15} />
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
                  style={{ right: '10px', color: 'var(--color-text-muted)', fontSize: '16px' }}
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
              style={{ marginTop: 'var(--space-2)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Demo Accounts:</div>
            <div>admin@hospital.com / password123</div>
            <div>doctor@hospital.com / password123</div>
            <div>reception@hospital.com / password123</div>
          </div>
          
          <p className="login-footer-note" style={{ marginTop: 'var(--space-4)' }}>
            Authorised personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
