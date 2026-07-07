import { useState, useEffect } from 'react';
import { getComplaints, addComment, getUserName } from '../services/api';
import Navbar from '../components/layout/Navbar';

const TrackComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Load complaints when the page loads
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (currentUser) {
      setUser(currentUser);
      setCurrentUser(currentUser);
      const allComplaints = getComplaints();
      // Filter complaints for this specific user
      const userComplaints = allComplaints.filter(c => c.userId === currentUser.id);
      // Sort by newest first
      userComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(userComplaints);
    }
  }, []);

  // -------- TIMELINE LOGIC --------
  const getStatusSteps = (complaint) => {
    const statusOrder = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = statusOrder.indexOf(complaint.status);
    
    const steps = [
      { label: '📥 Submitted', desc: 'Your complaint has been recorded.' },
      { label: '🔍 Verified', desc: 'Authority has verified the issue.' },
      { label: '👮 Assigned', desc: 'An officer has been assigned.' },
      { label: '🛠️ In Progress', desc: 'Work is currently in progress.' },
      { label: '✅ Resolved', desc: 'Your issue has been resolved!' },
    ];

    return steps.map((step, index) => ({
      ...step,
      active: index <= currentIndex,
      date: index === 0 
        ? new Date(complaint.createdAt).toLocaleDateString() 
        : (index <= currentIndex ? new Date().toLocaleDateString() : ''),
    }));
  };

  // -------- ADD COMMENT HANDLER --------
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const updated = addComment(selectedComplaint.id, currentUser.id, commentText);
    setSelectedComplaint(updated);
    setCommentText('');
    
    const updatedComplaints = complaints.map(c => 
      c.id === updated.id ? updated : c
    );
    setComplaints(updatedComplaints);
  };

  // If no user is logged in
  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-primary, #1a202c)' }}>Please login to track complaints.</div>;
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: 'var(--text-primary, #1a202c)' }}>📍 Track Your Complaints</h2>
        <p style={styles.subtitle}>Click on any complaint to view its current status and detailed timeline.</p>

        {complaints.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ color: 'var(--text-secondary, #4a5568)' }}>You haven't reported any issues yet.</p>
            <button onClick={() => window.location.href = '/report-issue'} style={styles.reportBtn}>
              ➕ Report an Issue
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {complaints.map((complaint) => (
              <div key={complaint.id} style={styles.card} onClick={() => setSelectedComplaint(complaint)}>
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
                <p style={styles.cardDate}>📅 {new Date(complaint.createdAt).toLocaleDateString()}</p>
                <p style={styles.clickHint}>Click to view timeline</p>
              </div>
            ))}
          </div>
        )}

        {/* ===== MODAL: Detailed Timeline ===== */}
        {selectedComplaint && (
          <div style={styles.modalOverlay} onClick={() => setSelectedComplaint(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setSelectedComplaint(null)}>✕</button>
              
              <h3 style={styles.modalTitle}>{selectedComplaint.title}</h3>
              <p style={styles.modalCategory}>📂 Category: {selectedComplaint.category}</p>
              <p style={styles.modalDesc}>📝 {selectedComplaint.description}</p>
              
              <h4 style={styles.timelineTitle}>📅 Status Timeline</h4>
              
              <div style={styles.timeline}>
                {getStatusSteps(selectedComplaint).map((step, index) => (
                  <div key={index} style={styles.timelineItem}>
                    <div style={{
                      ...styles.timelineDot,
                      background: step.active ? '#48bb78' : 'var(--border-color, #e2e8f0)',
                    }}></div>
                    <div style={styles.timelineContent}>
                      <p style={{
                        ...styles.timelineLabel,
                        color: step.active ? 'var(--text-primary, #2d3748)' : 'var(--text-secondary, #a0aec0)',
                      }}>
                        {step.label}
                      </p>
                      <p style={{
                        ...styles.timelineDesc,
                        color: step.active ? 'var(--text-secondary, #4a5568)' : 'var(--text-secondary, #cbd5e0)',
                      }}>
                        {step.desc}
                      </p>
                      {step.date && <p style={styles.timelineDate}>{step.date}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== COMMENTS SECTION ===== */}
              <div style={styles.commentSection}>
                <h4 style={styles.remarksTitle}>💬 Comments</h4>
                {selectedComplaint.comments?.length > 0 ? (
                  selectedComplaint.comments.map((comment, idx) => {
                    const userName = getUserName(comment.userId);
                    return (
                      <div key={idx} style={styles.remarkItem}>
                        <p style={styles.remarkText}>💬 {comment.text}</p>
                        <p style={styles.remarkMeta}>— {userName} on {new Date(comment.timestamp).toLocaleString()}</p>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-secondary, #a0aec0)', fontSize: '14px' }}>No comments yet.</p>
                )}
                
                {currentUser && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={styles.remarkInput}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      style={styles.postBtn}
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== STYLES =====
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
  empty: {
    textAlign: 'center',
    padding: '40px',
    background: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s',
  },
  reportBtn: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '30px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'var(--bg-card, #ffffff)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    transition: 'transform 0.2s, boxShadow 0.2s',
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
    color: 'var(--text-primary, #2d3748)',
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
  cardDate: {
    fontSize: '13px',
    color: 'var(--text-secondary, #a0aec0)',
    margin: '4px 0',
  },
  clickHint: {
    fontSize: '12px',
    color: '#48bb78',
    margin: '8px 0 0',
    textAlign: 'right',
    fontWeight: '500',
  },
  // Modal Styles
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
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s',
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
    color: 'var(--text-primary, #2d3748)',
  },
  modalCategory: {
    color: 'var(--text-secondary, #718096)',
    fontSize: '14px',
    margin: '0 0 10px 0',
  },
  modalDesc: {
    color: 'var(--text-primary, #4a5568)',
    padding: '12px',
    background: 'var(--bg-input, #f7fafc)',
    borderRadius: '8px',
    margin: '0 0 20px 0',
    transition: 'background 0.3s, color 0.3s',
  },
  timelineTitle: {
    margin: '0 0 15px 0',
    color: 'var(--text-primary, #2d3748)',
    borderBottom: '2px solid var(--border-color, #e2e8f0)',
    paddingBottom: '10px',
    transition: 'border-color 0.3s',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  timelineItem: {
    display: 'flex',
    gap: '15px',
    paddingBottom: '25px',
    position: 'relative',
  },
  timelineDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
    border: '2px solid var(--bg-card, #ffffff)',
    boxShadow: '0 0 0 2px var(--border-color, #e2e8f0)',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontWeight: '600',
    fontSize: '15px',
    margin: '0 0 2px 0',
  },
  timelineDesc: {
    fontSize: '13px',
    margin: '0 0 2px 0',
  },
  timelineDate: {
    fontSize: '11px',
    color: 'var(--text-secondary, #a0aec0)',
    margin: '4px 0 0 0',
  },
  // Comments
  commentSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '2px solid var(--border-color, #e2e8f0)',
    transition: 'border-color 0.3s',
  },
  remarksTitle: {
    margin: '0 0 10px 0',
    color: 'var(--text-primary, #2d3748)',
  },
  remarkItem: {
    background: 'var(--bg-input, #f7fafc)',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'background 0.3s',
  },
  remarkText: {
    margin: '0',
    color: 'var(--text-primary, #4a5568)',
  },
  remarkMeta: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'var(--text-secondary, #a0aec0)',
  },
  remarkInput: {
    flex: 1,
    padding: '10px 14px',
    border: '2px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg-input, #f7fafc)',
    color: 'var(--text-primary, #2d3748)',
    transition: 'border 0.3s, background 0.3s, color 0.3s',
  },
  postBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
  },
};

export default TrackComplaint;