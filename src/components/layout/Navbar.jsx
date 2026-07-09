import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('civiclens_current_user'));
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('civiclens_current_user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>
          <span style={styles.logoIcon}>🏙️</span>
          <span style={styles.logoText}>CivicLens</span>
        </Link>
      </div>
      <div style={styles.links}>
        {/* Citizen-only links */}
        {user.role === 'citizen' && (
          <>
            <Link to="/citizen-dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/report-issue" style={styles.link}>Report Issue</Link>
            <Link to="/track-complaint" style={styles.link}>Track</Link>
          </>
        )}
        
        {/* Officer-only links */}
        {user.role === 'officer' && (
          <>
            <Link to="/officer-dashboard" style={styles.link}>Assigned</Link>
          </>
        )}
        
        {/* Admin has no extra links */}
        {user.role === 'admin' && (
          <></>
        )}
        
        <Link to="/profile" style={styles.link}>Profile</Link>
        
        <span style={styles.userBadge}>👋 {user.name}</span>
        
        <button onClick={toggleTheme} style={styles.themeBtn}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

// ===== STYLES – Clean, no border, no shadow =====
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 40px',
    background: 'var(--bg-secondary, #ffffff)',
    // ✅ Removed boxShadow – no line
    // boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: 'none', // ✅ No border
    transition: 'background 0.3s',
    width: '100%',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: { fontSize: '26px' },
  logoText: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  link: {
    textDecoration: 'none',
    color: 'var(--text-primary, #2d3748)',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  userBadge: {
    background: 'var(--badge-bg, #f0fff4)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    color: 'var(--text-primary, #2d3748)',
    border: '1px solid var(--border-color, #c6f6d5)',
    transition: 'all 0.3s',
  },
  themeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    width: 'auto',
    padding: '4px 8px',
    transition: 'transform 0.2s',
  },
  logoutBtn: {
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
    transition: 'all 0.3s',
  },
};

export default Navbar;