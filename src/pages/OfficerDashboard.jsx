import { useState, useEffect } from 'react';
import { 
  getAssignedComplaints, 
  getPendingComplaints, 
  claimComplaint,
  updateComplaintWithRemark,
  getComplaintById 
} from '../services/api';
import Navbar from '../components/layout/Navbar';
import { showToast } from '../components/common/Toast';

const OfficerDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'pending'

  // Load data when page loads or when changes happen
  const loadData = () => {
    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (currentUser && currentUser.role === 'officer') {
      setUser(currentUser);
      
      // Get complaints assigned to this officer
      const assigned = getAssignedComplaints(currentUser.id);
      setAssignedComplaints(assigned);
      
      // Get pending complaints (available to claim)
      const pending = getPendingComplaints();
      setPendingComplaints(pending);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------- CLAIM COMPLAINT --------
  const handleClaim = (complaintId) => {
    if (!user) return;
    setLoading(true);
    claimComplaint(complaintId, user.id);
    // Refresh data
    loadData();
    setLoading(false);
    showToast('✅ Complaint claimed successfully!', 'success');
  };

  // -------- UPDATE STATUS --------
  const handleStatusUpdate = (complaintId, newStatus, remark) => {
    if (!user) return;
    setLoading(true);
    updateComplaintWithRemark(complaintId, newStatus, remark, user.name);
    // Refresh data
    loadData();
    setLoading(false);
    showToast('✅ Status updated successfully!', 'success');
    // Close modal if open
    setSelectedComplaint(null);
  };

  // -------- VIEW DETAILS (Modal) --------
  const handleViewDetails = (complaintId) => {
    const complaint = getComplaintById(complaintId);
    setSelectedComplaint(complaint);
  };

  // -------- RENDER FUNCTIONS --------
  const renderComplaintCard = (complaint, showClaimBtn = false) => (
    <div key={complaint.id} style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{complaint.title}</h3>
        <span style={{
          ...styles.statusBadge,
          background: complaint.status === 'Resolved' ? '#c6f6d5' : '#fefcbf',
          color: complaint.status === 'Resolved' ? '#276749' : '#975a16',
        }}>
          {complaint.status}
        </span>
      </div>
      <p style={styles.cardCategory}>📂 {complaint.category}</p>
      <p style={styles.cardDesc}>{complaint.description?.slice(0, 80)}...</p>
      <p style={styles.cardDate}>📅 {new Date(complaint.createdAt).toLocaleDateString()}</p>
      <div style={styles.cardActions}>
        <button style={styles.viewBtn} onClick={() => handleViewDetails(complaint.id)}>
          👁️ View Details
        </button>
        {showClaimBtn && (
          <button 
            style={styles.claimBtn} 
            onClick={() => handleClaim(complaint.id)}
            disabled={loading}
          >
            🎯 Claim
          </button>
        )}
      </div>
    </div>
  );

  // If not logged in as officer
  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Please login as an officer to access this dashboard.</div>;
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>👮 Officer Dashboard</h2>
        <p style={styles.subtitle}>Welcome back, {user.name}! Manage complaints assigned to you or claim new ones.</p>

        {/* Tab Navigation */}
        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'assigned' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('assigned')}
          >
            📋 Assigned ({assignedComplaints.length})
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'pending' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('pending')}
          >
            🆕 Available ({pendingComplaints.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'assigned' ? (
          <div>
            {assignedComplaints.length === 0 ? (
              <div style={styles.empty}>
                <p>No complaints assigned to you yet. Check the "Available" tab to claim new ones!</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {assignedComplaints.map(c => renderComplaintCard(c, false))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {pendingComplaints.length === 0 ? (
              <div style={styles.empty}>
                <p>No pending complaints available. All caught up! 🎉</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {pendingComplaints.map(c => renderComplaintCard(c, true))}
              </div>
            )}
          </div>
        )}

        {/* -------- MODAL: COMPLAINT DETAILS + STATUS UPDATE -------- */}
        {selectedComplaint && (
          <div style={styles.modalOverlay} onClick={() => setSelectedComplaint(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setSelectedComplaint(null)}>✕</button>
              
              <h3 style={styles.modalTitle}>{selectedComplaint.title}</h3>
              <p style={styles.modalCategory}>📂 Category: {selectedComplaint.category}</p>
              <p style={styles.modalDesc}>📝 {selectedComplaint.description}</p>
              <p style={styles.modalDesc}>📍 Location: {selectedComplaint.location || 'Not provided'}</p>
              
              {/* Image Preview */}
              {selectedComplaint.image && (
                <div style={styles.imageContainer}>
                  <img src={selectedComplaint.image} alt="Complaint" style={styles.modalImage} />
                </div>
              )}

              <div style={styles.divider}></div>

              {/* Status Update */}
              <div style={styles.updateSection}>
                <label style={styles.label}>Update Status:</label>
                <select 
                  style={styles.select} 
                  value={selectedComplaint.status}
                  onChange={(e) => {
                    setSelectedComplaint({ ...selectedComplaint, status: e.target.value });
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                
                {/* Remarks Input */}
                <label style={{ ...styles.label, marginTop: '15px' }}>Add Remark (Optional):</label>
                <input 
                  type="text" 
                  id="remarkInput"
                  placeholder="e.g. Inspected the site, work started..."
                  style={styles.remarkInput}
                />
                
                <button 
                  style={styles.updateBtn}
                  onClick={() => {
                    const remark = document.getElementById('remarkInput').value;
                    handleStatusUpdate(selectedComplaint.id, selectedComplaint.status, remark);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : '✅ Update Status'}
                </button>
              </div>

              {/* Remarks History */}
              {selectedComplaint.remarks && selectedComplaint.remarks.length > 0 && (
                <div style={styles.remarksSection}>
                  <h4 style={styles.remarksTitle}>📝 Activity Log</h4>
                  {selectedComplaint.remarks.map((remark, idx) => (
                    <div key={idx} style={styles.remarkItem}>
                      <p style={styles.remarkText}>💬 {remark.text}</p>
                      <p style={styles.remarkMeta}>— {remark.officer} on {new Date(remark.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== STYLES - DARK MODE FIXED =====
const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px',
  },
  subtitle: {
    color: 'var(--text-secondary, #718096)',
    marginBottom: '30px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    borderBottom: '2px solid var(--border-color, #c6f6d5)',
    paddingBottom: '10px',
  },
  tab: {
    padding: '10px 24px',
    background: 'var(--bg-input, #f1f5f9)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    color: 'var(--text-secondary, #718096)',
    width: 'auto',
  },
  tabActive: {
    background: '#48bb78',
    color: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'var(--bg-card, #ffffff)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow, 0 2px 10px rgba(0,0,0,0.05))',
    border: '1px solid var(--border-color, #e2e8f0)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-primary, #1a202c)',
    flex: 1,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    marginLeft: '10px',
  },
  cardCategory: {
    fontSize: '14px',
    color: 'var(--text-secondary, #718096)',
    margin: '4px 0',
  },
  cardDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary, #4a5568)',
    margin: '8px 0',
  },
  cardDate: {
    fontSize: '13px',
    color: 'var(--text-secondary, #a0aec0)',
    margin: '4px 0 12px 0',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    width: 'auto',
  },
  claimBtn: {
    padding: '8px 16px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    width: 'auto',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    color: 'var(--text-secondary, #718096)',
  },
  // Modal Styles - Dark Mode Ready
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '550px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-secondary, #a0aec0)',
    cursor: 'pointer',
    width: 'auto',
    padding: '5px 10px',
  },
  modalTitle: {
    margin: '0 0 5px 0',
    color: 'var(--text-primary, #1a202c)',
  },
  modalCategory: {
    color: 'var(--text-secondary, #718096)',
    fontSize: '14px',
    margin: '0 0 10px 0',
  },
  modalDesc: {
    color: 'var(--text-secondary, #4a5568)',
    padding: '12px',
    background: 'var(--bg-input, #f0fff4)',
    borderRadius: '8px',
    margin: '0 0 15px 0',
  },
  imageContainer: {
    marginBottom: '15px',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #c6f6d5)',
  },
  divider: {
    borderTop: '2px solid var(--border-color, #c6f6d5)',
    margin: '15px 0',
  },
  updateSection: {
    margin: '15px 0',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: 'var(--text-primary, #2d3748)',
    marginBottom: '6px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid var(--border-color, #c6f6d5)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg-input, #f0fff4)',
    color: 'var(--text-primary, #2d3748)',
  },
  remarkInput: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid var(--border-color, #c6f6d5)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg-input, #f0fff4)',
    color: 'var(--text-primary, #2d3748)',
    marginBottom: '12px',
  },
  updateBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  remarksSection: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '2px solid var(--border-color, #c6f6d5)',
  },
  remarksTitle: {
    margin: '0 0 10px 0',
    color: 'var(--text-primary, #2d3748)',
  },
  remarkItem: {
    background: 'var(--bg-input, #f0fff4)',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  remarkText: {
    margin: '0',
    color: 'var(--text-secondary, #4a5568)',
  },
  remarkMeta: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'var(--text-secondary, #a0aec0)',
  },
};

export default OfficerDashboard;