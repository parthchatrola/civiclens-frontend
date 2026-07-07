import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../services/api';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
  const [user, setUser] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (currentUser) {
      setUser(currentUser);
      
      const allComplaints = getComplaints();
      const userComplaints = allComplaints.filter(c => c.userId === currentUser.id);
      setMyComplaints(userComplaints);

      const total = userComplaints.length;
      const pending = userComplaints.filter(c => c.status !== 'Resolved').length;
      const resolved = userComplaints.filter(c => c.status === 'Resolved').length;
      setStats({ total, pending, resolved });
    }
  }, []);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-primary)' }}>
          Please login to view your dashboard.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.title}
        >
          👋 Welcome back, {user.name}!
        </motion.h2>
        <p style={styles.subtitle}>Track your civic complaints easily</p>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.statsGrid}
        >
          {[
            { label: '📋 Total Complaints', value: stats.total, color: '#48bb78' },
            { label: '⏳ Pending', value: stats.pending, color: '#ecc94b' },
            { label: '✅ Resolved', value: stats.resolved, color: '#48bb78' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              style={{ ...styles.card, borderBottom: `5px solid ${stat.color}` }}
            >
              <h3 style={styles.cardLabel}>{stat.label}</h3>
              <p style={styles.number}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.actionSection}
        >
          <Link to="/report-issue">
            <button style={styles.reportBtn}>➕ Report New Issue (GPS Required)</button>
          </Link>
        </motion.div>

        {/* Recent Complaints */}
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.sectionTitle}
        >
          📌 Your Recent Complaints
        </motion.h3>

        {myComplaints.length === 0 ? (
          <div style={styles.empty}>
            You haven't reported any issues yet.<br />
            Click "Report New Issue" to start!
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={styles.tableWrapper}
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myComplaints.slice(0, 5).map((complaint) => (
                  <tr key={complaint.id}>
                    <td style={styles.td}>{complaint.title}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: complaint.status === 'Resolved' ? '#c6f6d5' : '#fefcbf',
                        color: complaint.status === 'Resolved' ? '#276749' : '#975a16',
                      }}>
                        {complaint.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myComplaints.length > 5 && (
              <p style={styles.viewAll}>+ {myComplaints.length - 5} more complaints...</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ==================== STYLES ====================
const styles = {
  container: {
    maxWidth: '1100px',
    margin: '90px auto 30px',
    padding: '0 20px',
  },
  title: {
    fontSize: '2.2rem',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary, #718096)',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    background: 'var(--bg-card, #ffffff)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow, 0 4px 15px rgba(0,0,0,0.1))',
    textAlign: 'center',
    transition: 'transform 0.3s',
  },
  cardLabel: {
    color: 'var(--text-secondary, #64748b)',
    fontSize: '14px',
    marginBottom: '8px',
  },
  number: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1a202c)',
  },
  actionSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  reportBtn: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    padding: '14px 40px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(72, 187, 120, 0.4)',
  },
  sectionTitle: {
    marginBottom: '15px',
    color: 'var(--text-primary, #1a202c)',
  },
  tableWrapper: {
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow, 0 4px 15px rgba(0,0,0,0.1))',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 12px',
    textAlign: 'left',
    color: 'var(--text-secondary, #64748b)',
    fontWeight: '600',
    borderBottom: '2px solid var(--border-color, #e2e8f0)',
  },
  td: {
    padding: '14px 12px',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    color: 'var(--text-primary, #1a202c)',
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
  },
  empty: {
    color: 'var(--text-secondary, #718096)',
    padding: '40px',
    textAlign: 'center',
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
  },
  viewAll: {
    marginTop: '12px',
    color: '#48bb78',
    fontSize: '14px',
    textAlign: 'right',
  },
};

export default CitizenDashboard;