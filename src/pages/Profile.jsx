import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUser, getUsers } from '../services/api';
import Navbar from '../components/layout/Navbar';
import { showToast } from '../components/common/Toast';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
    });
  }, [navigate]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setMessage({ text: 'Please enter a valid 10-digit phone number.', type: 'error' });
      setLoading(false);
      return;
    }

    const updated = updateUser(user.id, formData);
    if (updated) {
      setUser(updated);
      setIsEditing(false);
      showToast('✅ Profile updated successfully!', 'success');
    } else {
      showToast('Failed to update profile.', 'error');
    }
    setLoading(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);

    const users = getUsers();
    const currentUserData = users.find(u => u.id === user.id);

    if (!currentUserData || currentUserData.password !== passwordData.currentPassword) {
      showToast('Current password is incorrect.', 'error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    const updated = updateUser(user.id, { password: passwordData.newPassword });
    if (updated) {
      showToast('✅ Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    }
    setLoading(false);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  if (!user) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading profile...</div>;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.profileCard}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.avatar}>{initials}</div>
            <h1 style={styles.name}>{user.name}</h1>
            <p style={styles.email}>{user.email}</p>
          </div>

          {/* Personal Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn}>
                {isEditing ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} style={styles.form}>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Full Name" style={styles.input} required />
                <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone Number" style={styles.input} />
                <button type="submit" style={styles.saveBtn} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Name</span>
                  <span style={styles.value}>{user.name}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{user.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{user.phone || 'Not added'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Role</span>
                  <span style={styles.roleBadge}>{user.role.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>🔒 Security</h3>
              <button onClick={() => setIsChangingPassword(!isChangingPassword)} style={styles.editBtn}>
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} style={styles.form}>
                <input type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} style={styles.input} required />
                <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} style={styles.input} required />
                <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} style={styles.input} required />
                <button type="submit" style={styles.saveBtn} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* Account Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Account Details</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.label}>Member Since</span>
                <span style={styles.value}>{new Date(parseInt(user.id)).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STYLES (Light + Dark Mode Ready) ====================
const styles = {
  container: {
    maxWidth: '680px',
    margin: '100px auto 50px',
    padding: '0 20px',
  },
  profileCard: {
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    border: '1px solid var(--border-color, #e2e8f0)',
  },
  header: {
    background: 'var(--bg-secondary, #1e2937)',
    padding: '40px 30px 30px',
    textAlign: 'center',
    color: 'var(--text-primary, #f1f5f9)',
  },
  avatar: {
    width: '90px',
    height: '90px',
    background: '#48bb78',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto 15px',
    border: '4px solid rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: '26px',
    margin: '0 0 6px 0',
    fontWeight: '700',
  },
  email: {
    color: 'var(--text-secondary, #94a3b8)',
    fontSize: '15px',
  },
  section: {
    padding: '30px',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: 'var(--text-primary, #1a202c)',
    fontSize: '18px',
    fontWeight: '600',
  },
  editBtn: {
    padding: '6px 18px',
    background: 'transparent',
    border: '2px solid #48bb78',
    color: '#48bb78',
    borderRadius: '30px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  infoItem: {
    background: 'var(--bg-input, #f8fafc)',
    padding: '14px 18px',
    borderRadius: '12px',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text-secondary, #64748b)',
    display: 'block',
    marginBottom: '4px',
  },
  value: {
    color: 'var(--text-primary, #1a202c)',
    fontSize: '15px',
    fontWeight: '500',
  },
  roleBadge: {
    background: '#f97316',
    color: 'white',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    background: 'var(--bg-input, #f8fafc)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    color: 'var(--text-primary, #1a202c)',
    fontSize: '15px',
  },
  saveBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #48bb78, #22c55e)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Profile;