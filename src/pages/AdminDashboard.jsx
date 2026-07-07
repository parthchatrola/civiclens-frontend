import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getComplaints, 
  getUsers, 
  deleteComplaint, 
  updateComplaintStatus 
} from '../services/api';
import Navbar from '../components/layout/Navbar';
import { showToast } from '../components/common/Toast';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
};

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalComplaintId, setModalComplaintId] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    resolved: 0,
  });

  const filteredComplaints = complaints.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');

  const loadData = () => {
    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      
      const allComplaints = getComplaints();
      setComplaints(allComplaints);
      
      const allUsers = getUsers();
      setOfficers(allUsers.filter(u => u.role === 'officer'));
      
      const total = allComplaints.length;
      const pending = allComplaints.filter(c => c.status === 'Pending').length;
      const assigned = allComplaints.filter(c => 
        ['Assigned', 'In Progress', 'Verified'].includes(c.status)
      ).length;
      const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
      
      setStats({ total, pending, assigned, resolved });
    }
  };

  const exportToCSV = () => {
    if (filteredComplaints.length === 0) {
      showToast('No complaints to export.', 'error');
      return;
    }

    const headers = ['Title', 'Category', 'Status', 'Location', 'Date'];
    const rows = filteredComplaints.map(c => [
      c.title,
      c.category,
      c.status,
      c.location || 'N/A',
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaints_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (complaintId, currentOfficerId) => {
    setModalComplaintId(complaintId);
    setSelectedOfficerId(currentOfficerId || '');
    setShowAssignModal(true);
  };

  const handleAssignFromModal = () => {
    if (!modalComplaintId || !selectedOfficerId) {
      showToast('Please select an officer.', 'error');
      return;
    }
    setLoading(true);
    updateComplaintStatus(modalComplaintId, 'Assigned', selectedOfficerId);
    loadData();
    setLoading(false);
    setShowAssignModal(false);
    showToast('✅ Complaint assigned successfully!', 'success');
  };

  const handleDelete = (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      setLoading(true);
      deleteComplaint(complaintId);
      loadData();
      setLoading(false);
      showToast('🗑️ Complaint deleted successfully.', 'success');
    }
  };

  const getOfficerName = (officerId) => {
    if (!officerId) return 'Unassigned';
    const officer = officers.find(o => o.id === officerId);
    return officer ? officer.name : 'Unknown';
  };

  const getCategoryData = () => {
    const categories = {};
    complaints.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });
    return {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Complaints by Category',
        data: Object.values(categories),
        backgroundColor: ['#48bb78', '#2f855a', '#ecc94b', '#fc8181', '#4fd1c5', '#9f7aea', '#ed8936'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  };

  const getStatusData = () => {
    const statusCounts = { Pending: 0, Assigned: 0, 'In Progress': 0, Resolved: 0 };
    complaints.forEach(c => {
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
      else statusCounts.Pending++;
    });
    return {
      labels: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
      datasets: [{
        label: 'Complaint Status',
        data: [statusCounts.Pending, statusCounts.Assigned, statusCounts['In Progress'], statusCounts.Resolved],
        backgroundColor: ['#ecc94b', '#48bb78', '#ed8936', '#48bb78'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '90px', color: 'var(--text-primary)' }}>
          Please login as admin to access this dashboard.
        </div>
      </div>
    );
  }

  const barOptions = {
    responsive: true,
    animation: { duration: 1500, easing: 'easeOutQuart' },
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: 'var(--text-primary, #1a202c)' }
      },
      title: { 
        display: true,
        text: 'Complaints by Category',
        color: 'var(--text-primary, #1a202c)'
      }
    },
    scales: {
      y: {
        ticks: { color: 'var(--text-secondary, #4a5568)' },
        grid: { color: 'var(--border-color, #e2e8f0)' }
      },
      x: {
        ticks: { color: 'var(--text-secondary, #4a5568)' },
        grid: { color: 'var(--border-color, #e2e8f0)' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'var(--text-primary, #1a202c)' }
      },
      title: {
        display: true,
        text: 'Complaint Status Distribution',
        color: 'var(--text-primary, #1a202c)'
      }
    },
  };

  return (
    <div>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.container}
      >
        <motion.h2 variants={fadeInDown} initial="hidden" animate="visible" style={styles.title}>
          👨‍💼 Admin Dashboard
        </motion.h2>
        <motion.p
          variants={fadeInDown}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          style={styles.subtitle}
        >
          Welcome back, {user.name}! Monitor and manage all city complaints.
        </motion.p>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={styles.statsGrid}
        >
          {[
            { label: '📋 Total', value: stats.total, color: '#48bb78' },
            { label: '⏳ Pending', value: stats.pending, color: '#ecc94b' },
            { label: '👮 Assigned', value: stats.assigned, color: '#ed8936' },
            { label: '✅ Resolved', value: stats.resolved, color: '#48bb78' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.03 }}
              style={{ ...styles.card, borderBottom: `4px solid ${stat.color}` }}
            >
              <h3 style={styles.cardLabel}>{stat.label}</h3>
              <p style={styles.number}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={styles.chartsGrid}
        >
          <motion.div variants={fadeInUp} whileHover={{ scale: 1.01 }} style={styles.chartCard}>
            <Bar data={getCategoryData()} options={barOptions} />
          </motion.div>
          <motion.div variants={fadeInUp} whileHover={{ scale: 1.01 }} style={styles.chartCard}>
            <Pie data={getStatusData()} options={pieOptions} />
          </motion.div>
        </motion.div>

        {/* Search + Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.searchContainer}
        >
          <input
            type="text"
            placeholder="🔍 Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSearchTerm('')} style={styles.clearBtn}>
            Clear
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportToCSV} style={styles.exportBtn}>
            📥 Export CSV
          </motion.button>
        </motion.div>

        {/* All Complaints Table (Non-Resolved) */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={styles.sectionTitle}
        >
          📌 All Complaints ({activeComplaints.length})
        </motion.h3>

        {activeComplaints.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.empty}>
            No active complaints.
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={styles.tableWrapper}
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Officer</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {filteredComplaints.filter(c => c.status !== 'Resolved').map((complaint) => (
                  <motion.tr
                    key={complaint.id}
                    variants={tableRowVariants}
                    whileHover={{ backgroundColor: 'var(--hover-bg, rgba(72, 187, 120, 0.05))' }}
                    style={styles.tr}
                  >
                    <td style={styles.td}>{complaint.title}</td>
                    <td style={styles.td}>{complaint.category}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: complaint.status === 'Resolved' ? '#c6f6d5' : '#fefcbf',
                        color: complaint.status === 'Resolved' ? '#276749' : '#975a16',
                      }}>
                        {complaint.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAssignModal(complaint.id, complaint.officerId)}
                        style={styles.assignButton}
                      >
                        <span>{getOfficerName(complaint.officerId)}</span>
                        <span style={{ marginLeft: '8px', fontSize: '14px' }}>▼</span>
                      </motion.button>
                    </td>
                    <td style={styles.td}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#e53e3e' }}
                        whileTap={{ scale: 0.9 }}
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(complaint.id)}
                        disabled={loading}
                      >
                        🗑️
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </motion.div>
        )}

        {/* Resolved Complaints Section */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={styles.sectionTitle}
        >
          ✅ Resolved Complaints ({resolvedComplaints.length})
        </motion.h3>

        {resolvedComplaints.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.empty}>
            No resolved complaints yet.
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={styles.tableWrapper}
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Officer</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {resolvedComplaints.map((complaint) => (
                  <motion.tr
                    key={complaint.id}
                    variants={tableRowVariants}
                    style={styles.tr}
                  >
                    <td style={styles.td}>{complaint.title}</td>
                    <td style={styles.td}>{complaint.category}</td>
                    <td style={styles.td}>{getOfficerName(complaint.officerId)}</td>
                    <td style={styles.td}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </motion.div>
        )}

        {/* Assign Officer Modal */}
        <AnimatePresence>
          {showAssignModal && (
            <div style={styles.modalOverlay}>
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={styles.modalContent}
              >
                <h3 style={{ color: 'var(--text-primary, #1a202c)', marginBottom: '4px' }}>Assign Officer</h3>
                <p style={{ color: 'var(--text-secondary, #718096)', marginBottom: '20px' }}>
                  Select an officer for this complaint
                </p>

                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  style={styles.modalSelect}
                >
                  <option value="">Select Officer...</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>

                <div style={styles.modalActions}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAssignModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAssignFromModal}
                    style={styles.confirmBtn}
                  >
                    Assign Officer
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ==================== STYLES ====================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '90px auto 30px',
    padding: '0 20px',
  },
  title: {
    fontSize: '2.2rem',
    marginBottom: '8px',
    color: 'var(--text-primary, #1a202c)',
  },
  subtitle: {
    color: 'var(--text-secondary, #718096)',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  card: {
    background: 'var(--bg-card, #ffffff)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow, 0 2px 10px rgba(0,0,0,0.05))',
    textAlign: 'center',
  },
  cardLabel: {
    color: 'var(--text-primary, #1a202c)',
  },
  number: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1a202c)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  chartCard: {
    background: 'var(--bg-card, #ffffff)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow, 0 2px 10px rgba(0,0,0,0.05))',
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg-input, #f7fafc)',
    color: 'var(--text-primary, #1a202c)',
    minWidth: '200px',
  },
  clearBtn: {
    padding: '10px 20px',
    background: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  exportBtn: {
    padding: '10px 20px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: '15px',
    color: 'var(--text-primary, #1a202c)',
  },
  tableWrapper: {
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: 'var(--shadow, 0 2px 10px rgba(0,0,0,0.05))',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '12px 10px',
    textAlign: 'left',
    color: 'var(--text-secondary, #4a5568)',
    fontWeight: '600',
    borderBottom: '2px solid var(--border-color, #e2e8f0)',
  },
  tr: {
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '12px 10px',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    verticalAlign: 'middle',
    color: 'var(--text-primary, #1a202c)',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  assignButton: {
    padding: '8px 14px',
    background: 'var(--bg-input, #f1f5f9)',
    color: 'var(--text-primary, #2d3748)',
    border: '1px solid var(--border-color, #cbd5e1)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '150px',
  },
  deleteBtn: {
    background: '#fc8181',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    color: 'var(--text-secondary, #718096)',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'var(--bg-card, #ffffff)',
    padding: '28px 32px',
    borderRadius: '16px',
    width: '380px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  modalSelect: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid var(--border-color, #e2e8f0)',
    fontSize: '15px',
    marginBottom: '20px',
    background: 'var(--bg-input, #ffffff)',
    color: 'var(--text-primary, #1a202c)',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: 'var(--bg-input, #e2e8f0)',
    color: 'var(--text-secondary, #475569)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '10px 24px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default AdminDashboard;