import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addComplaint } from '../services/api';
import Navbar from '../components/layout/Navbar';
import { IoCloseCircle } from "react-icons/io5";

const ReportIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Get image from camera
  useEffect(() => {
    if (location.state?.capturedImage) {
      const file = location.state.capturedImage;
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image.');
      return;
    }

    setError('');
    setImage(file);
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  const handleCameraOpen = () => navigate('/camera');

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));
        setLoading(false);
        setError('');
        alert('📍 GPS Location captured successfully!');
      },
      () => {
        setLoading(false);
        setError('Failed to get GPS. Please allow location access.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!image) return setError('Image is required');
    if (!formData.latitude || !formData.longitude) {
      return setError('GPS Location is mandatory. Please click "Get GPS"');
    }

    setLoading(true);

    const currentUser = JSON.parse(localStorage.getItem('civiclens_current_user'));
    if (!currentUser) {
      setError('Please login first.');
      setLoading(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("image", image);

      const aiResponse = await fetch(
        "http://10.42.80.69:8000/predict",
        {
          method: "POST",
          body: uploadData,
        }
      );

      if (!aiResponse.ok) {
        throw new Error("Prediction Failed");
      }

      const prediction = await aiResponse.json();

      const newComplaint = {
        title: formData.title,
        category: prediction.category,
        confidence: prediction.confidence,
        description: formData.description,
        image: prediction.saved_path,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        userId: currentUser.id,
        status: "Pending",
        createdAt: Date.now(),
      };

      addComplaint(newComplaint);

      alert("Complaint Submitted Successfully!");
      navigate("/citizen-dashboard");
    } catch (err) {
      console.error(err);
      setError("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <br />
      <br />
      <br />
      <div style={{
        ...styles.container,
        margin: isMobile ? '80px auto 20px' : '30px auto',
        padding: isMobile ? '0 16px' : '0 20px',
      }}>
        {/* No extra <br> – use proper margin */}
        <div style={styles.headerSection}>
          <h2 style={{
            ...styles.heading,
            fontSize: isMobile ? '24px' : '32px',
            marginBottom: isMobile ? '4px' : '8px',
          }}>
            Report a Civic Issue
          </h2>
          <p style={{
            ...styles.subtitle,
            fontSize: isMobile ? '14px' : '16px',
            marginBottom: isMobile ? '20px' : '30px',
          }}>
            Help improve your city • GPS is mandatory
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{
          ...styles.form,
          padding: isMobile ? '20px 16px' : '30px',
          borderRadius: isMobile ? '14px' : '16px',
        }}>
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              fontSize: isMobile ? '14px' : '15px',
            }}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={{
                ...styles.input,
                padding: isMobile ? '10px 14px' : '12px 16px',
                fontSize: isMobile ? '14px' : '15px',
                borderRadius: isMobile ? '10px' : '12px',
              }}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              fontSize: isMobile ? '14px' : '15px',
            }}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{
                ...styles.input,
                minHeight: '100px',
                padding: isMobile ? '10px 14px' : '12px 16px',
                fontSize: isMobile ? '14px' : '15px',
                borderRadius: isMobile ? '10px' : '12px',
                resize: 'vertical',
              }}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              fontSize: isMobile ? '14px' : '15px',
            }}>Image * (Photo of Issue)</label>
            <div style={{
              ...styles.imageButtonGroup,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '8px' : '10px',
            }}>
              <button
                type="button"
                onClick={handleCameraOpen}
                style={{
                  ...styles.cameraBtn,
                  padding: isMobile ? '10px 16px' : '10px 20px',
                  fontSize: isMobile ? '14px' : '15px',
                  width: isMobile ? '100%' : 'auto',
                  borderRadius: isMobile ? '10px' : '12px',
                }}
              >
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  ...styles.uploadBtn,
                  padding: isMobile ? '10px 16px' : '10px 20px',
                  fontSize: isMobile ? '14px' : '15px',
                  width: isMobile ? '100%' : 'auto',
                  borderRadius: isMobile ? '10px' : '12px',
                }}
              >
                📁 Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {imagePreview && (
              <div style={styles.previewContainer}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    ...styles.previewImage,
                    maxWidth: isMobile ? '150px' : '200px',
                    maxHeight: isMobile ? '150px' : '200px',
                    borderRadius: isMobile ? '10px' : '12px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    ...styles.removeImageBtn,
                    fontSize: isMobile ? '24px' : '28px',
                    top: isMobile ? '4px' : '8px',
                    right: isMobile ? '4px' : '8px',
                  }}
                >
                  <IoCloseCircle />
                </button>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              fontSize: isMobile ? '14px' : '15px',
            }}>GPS Location</label>
            <div style={{
              ...styles.locationRow,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '8px' : '10px',
            }}>
              <input
                type="text"
                value={formData.location}
                placeholder="GPS Coordinates"
                readOnly
                style={{
                  ...styles.input,
                  flex: 1,
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  fontSize: isMobile ? '14px' : '15px',
                  borderRadius: isMobile ? '10px' : '12px',
                  width: isMobile ? '100%' : 'auto',
                }}
              />
              <button
                type="button"
                onClick={getLocation}
                style={{
                  ...styles.gpsBtn,
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  fontSize: isMobile ? '14px' : '15px',
                  borderRadius: isMobile ? '10px' : '12px',
                  width: isMobile ? '100%' : 'auto',
                }}
                disabled={loading}
              >
                {loading ? 'Fetching...' : '📍 Get GPS'}
              </button>
            </div>
            {formData.latitude && (
              <p style={{
                ...styles.coords,
                fontSize: isMobile ? '12px' : '13px',
                marginTop: isMobile ? '6px' : '8px',
              }}>
                Lat: {formData.latitude} | Lon: {formData.longitude}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              padding: isMobile ? '12px' : '14px',
              fontSize: isMobile ? '15px' : '16px',
              borderRadius: isMobile ? '12px' : '14px',
            }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : '🚀 Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ===== STYLES – Responsive =====
const styles = {
  container: {
    maxWidth: '700px',
    margin: '30px auto',
    padding: '0 20px',
  },
  headerSection: {
    marginBottom: '8px',
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary, #718096)',
    fontSize: '16px',
    marginBottom: '30px',
  },
  error: {
    background: '#fed7d7',
    color: '#e53e3e',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  form: {
    background: 'var(--bg-card, white)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: 'var(--text-primary, #2d3748)',
    marginBottom: '6px',
    fontSize: '15px',
    transition: 'color 0.3s',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid var(--border-color, #e2e8f0)',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'border 0.3s, background 0.3s, color 0.3s',
    background: 'var(--bg-input, #f7fafc)',
    color: 'var(--text-primary, #2d3748)',
    boxSizing: 'border-box',
  },
  imageButtonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cameraBtn: {
    padding: '10px 20px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  uploadBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  previewContainer: {
    marginTop: '10px',
    position: 'relative',
    display: 'inline-block',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '12px',
    border: '2px solid var(--border-color, #e2e8f0)',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '28px',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    display: 'flex',
    gap: '10px',
  },
  gpsBtn: {
    padding: '12px 20px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
    whiteSpace: 'nowrap',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  coords: {
    marginTop: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary, #4a5568)',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};

export default ReportIssue;