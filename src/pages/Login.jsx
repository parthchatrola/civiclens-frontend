import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { findUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = findUser(formData.email, formData.password);

      if (user) {
        localStorage.setItem('civiclens_current_user', JSON.stringify(user));
        setLoading(false);
        
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'officer') {
          navigate('/officer-dashboard');
        } else {
          navigate('/citizen-dashboard');
        }
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'var(--bg-primary, #ffffff)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'auto',
      transition: 'background 0.3s ease',
    }}>
      <div className="login-card" style={{
        background: 'var(--bg-card, #ffffff)',
        padding: '40px 35px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '420px',
        margin: '20px',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '32px' }}>🏙️</span>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CivicLens
            </span>
          </div>
        </Link>

        <h2 style={{ 
          color: 'var(--text-primary, #1a202c)', 
          fontSize: '28px', 
          marginBottom: '8px', 
          textAlign: 'center',
          transition: 'color 0.3s ease',
        }}>
          Welcome
        </h2>
        <p style={{ 
          color: 'var(--text-secondary, #4a5568)', 
          marginBottom: '24px', 
          fontSize: '14px', 
          textAlign: 'center',
          transition: 'color 0.3s ease',
        }}>
          Login to report and track civic issues
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: 'var(--text-primary, #2d3748)', 
              marginBottom: '6px', 
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border-color, #e2e8f0)',
                borderRadius: '10px',
                fontSize: '14px',
                background: 'var(--bg-input, #f7fafc)',
                color: 'var(--text-primary, #2d3748)',
                transition: 'border 0.3s, background 0.3s, color 0.3s',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: 'var(--text-primary, #2d3748)', 
              marginBottom: '6px', 
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border-color, #e2e8f0)',
                borderRadius: '10px',
                fontSize: '14px',
                background: 'var(--bg-input, #f7fafc)',
                color: 'var(--text-primary, #2d3748)',
                transition: 'border 0.3s, background 0.3s, color 0.3s',
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-link" style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px',
          color: 'var(--text-secondary, #4a5568)',
          transition: 'color 0.3s ease',
        }}>
          Don't have an account? <Link to="/register" style={{ color: '#48bb78', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;