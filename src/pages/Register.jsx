import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUser, isEmailTaken } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });

  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setError('');
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setIsOtpSent(true);
    alert(`📱 Your OTP is: ${otp}\n(Simulating SMS - In production, this would be sent to your phone.)`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setIsOtpVerified(true);
      setError('');
      alert('✅ OTP Verified Successfully! You can now register.');
    } else {
      setError('❌ Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isOtpVerified) {
      setError('Please verify your phone number with OTP first.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (isEmailTaken(formData.email)) {
      setError('This email is already registered. Please login.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      addUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      setSuccess('Registration successful! Redirecting to login...');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      <div className="login-card register-card" style={{
        background: 'var(--bg-card, #ffffff)',
        padding: '40px 35px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '95vh',
        overflowY: 'auto',
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
          Create Account
        </h2>
        <p style={{ 
          color: 'var(--text-secondary, #4a5568)', 
          marginBottom: '24px', 
          fontSize: '14px', 
          textAlign: 'center',
          transition: 'color 0.3s ease',
        }}>
          Verify your phone and join CivicLens
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
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
              Phone Number
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={isOtpSent && !isOtpVerified}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid var(--border-color, #e2e8f0)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'var(--bg-input, #f7fafc)',
                  color: 'var(--text-primary, #2d3748)',
                  transition: 'border 0.3s, background 0.3s, color 0.3s',
                }}
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isOtpSent && !isOtpVerified}
                style={{
                  width: 'auto',
                  padding: '12px 20px',
                  background: isOtpVerified ? '#48bb78' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isOtpVerified ? 'Verified' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          </div>

          {isOtpSent && !isOtpVerified && (
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'var(--text-primary, #2d3748)', 
                marginBottom: '6px', 
                fontSize: '14px',
                transition: 'color 0.3s ease',
              }}>
                Enter OTP
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  maxLength={4}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid var(--border-color, #e2e8f0)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: 'var(--bg-input, #f7fafc)',
                    color: 'var(--text-primary, #2d3748)',
                    transition: 'border 0.3s, background 0.3s, color 0.3s',
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  style={{
                    width: 'auto',
                    padding: '12px 20px',
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {isOtpVerified && (
            <div style={{ 
              color: '#276749', 
              fontSize: '14px', 
              marginBottom: '16px',
              transition: 'color 0.3s ease',
            }}>
              Phone number verified successfully!
            </div>
          )}

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
              placeholder="Min 6 characters"
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

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: 'var(--text-primary, #2d3748)', 
              marginBottom: '6px', 
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
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
              Register as
            </label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
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
            >
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isOtpVerified}
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
              opacity: (isLoading || !isOtpVerified) ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="register-link" style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px',
          color: 'var(--text-secondary, #4a5568)',
          transition: 'color 0.3s ease',
        }}>
          Already have an account? <Link to="/login" style={{ color: '#48bb78', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;