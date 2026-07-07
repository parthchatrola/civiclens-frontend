import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TermsOfService = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #ffffff)',
      color: 'var(--text-primary, #1a202c)',
      transition: 'background 0.3s, color 0.3s',
    }}>
      {/* ===== PUBLIC NAVBAR ===== */}
      <nav style={navbarStyles.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={navbarStyles.navLogo}>
            <span style={navbarStyles.logoIcon}>🏙️</span>
            <span style={navbarStyles.logoText}>CivicLens</span>
          </div>
        </Link>
        <div style={navbarStyles.navLinks}>
          <button onClick={toggleTheme} style={navbarStyles.themeBtn}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/login">
            <button style={navbarStyles.navBtn}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{ ...navbarStyles.navBtn, ...navbarStyles.navBtnPrimary }}>Register</button>
          </Link>
        </div>
      </nav>

      {/* ===== PAGE CONTENT ===== */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '100px 20px 40px',
      }}>
        <h1 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '20px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary, #4a5568)', marginBottom: '30px' }}>Last updated: July 2026</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '10px' }}>1. Acceptance of Terms</h2>
          <p style={{ color: 'var(--text-secondary, #4a5568)', lineHeight: '1.8' }}>
            By using CivicLens, you agree to these terms. If you do not agree, please do not use our platform.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '10px' }}>2. User Responsibilities</h2>
          <p style={{ color: 'var(--text-secondary, #4a5568)', lineHeight: '1.8' }}>
            You are responsible for providing accurate information when reporting issues. Do not upload inappropriate content or false information.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '10px' }}>3. Intellectual Property</h2>
          <p style={{ color: 'var(--text-secondary, #4a5568)', lineHeight: '1.8' }}>
            All content on CivicLens is protected by copyright. You may not reproduce or distribute our content without permission.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '10px' }}>4. Limitation of Liability</h2>
          <p style={{ color: 'var(--text-secondary, #4a5568)', lineHeight: '1.8' }}>
            CivicLens is provided "as is" without warranties. We are not liable for damages arising from using our platform.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '10px' }}>5. Termination</h2>
          <p style={{ color: 'var(--text-secondary, #4a5568)', lineHeight: '1.8' }}>
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </section>
      </div>
    </div>
  );
};

// ===== NAVBAR STYLES =====
const navbarStyles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    background: 'var(--bg-secondary, #ffffff)',
    boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border-color 0.3s',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: '700',
  },
  logoIcon: { fontSize: '28px' },
  logoText: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  },
  themeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    width: 'auto',
    padding: '4px 8px',
    transition: 'transform 0.2s',
  },
  navBtn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '2px solid #48bb78',
    borderRadius: '8px',
    color: '#48bb78',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'auto',
    transition: 'all 0.3s',
  },
  navBtnPrimary: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
  },
};

export default TermsOfService;