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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // const categories = [
  //   'garbage', 'pothole', 'road_crack', 'street_light',
  //   'water_leak'
  // ];

  // Get image from camera
  useEffect(() => {
    if (location.state?.capturedImage) {
      setImage(location.state.capturedImage);
      setImagePreview(location.state.capturedImage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
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
      (err) => {
        setLoading(false);
        setError('Failed to get GPS. Please allow location access.');
      }
    );
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Title is required');
    // if (!formData.category) return setError("Category is required");
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
        "http://127.0.0.1:8000/predict",
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
      <div style={styles.container}>
        <h2>Report a Civic Issue</h2>
        <p style={styles.subtitle}>Help improve your city • GPS is mandatory</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
          </div>

          {/* <div style={styles.formGroup}>
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} style={styles.input} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)              
              }
            </select>
          </div> */}

          <div style={styles.formGroup}>
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={{...styles.input, minHeight: '100px'}} required />
          </div>

          <div style={styles.formGroup}>
            <label>Image * (Photo of Issue)</label>
            <div style={styles.imageButtonGroup}>
              <button type="button" onClick={handleCameraOpen} style={styles.cameraBtn}>📷 Take Photo</button>
              <button type="button" onClick={() => fileInputRef.current.click()} style={styles.uploadBtn}>📁 Upload</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
            </div>

            {imagePreview && (
              <div style={styles.previewContainer}>
                <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                <button type="button" onClick={handleRemoveImage} style={styles.removeImageBtn}>
                  <IoCloseCircle />
                </button>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label>GPS Location</label>
            <div style={styles.locationRow}>
              <input 
                type="text" 
                value={formData.location} 
                placeholder="GPS Coordinates" 
                readOnly 
                style={{...styles.input, flex: 1}} 
              />
              <button type="button" onClick={getLocation} style={styles.gpsBtn} disabled={loading}>
                {loading ? 'Fetching...' : '📍 Get GPS'}
              </button>
            </div>
            {formData.latitude && (
              <p style={styles.coords}>Lat: {formData.latitude} | Lon: {formData.longitude}</p>
            )}
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : '🚀 Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ===== STYLES =====
const styles = {
  container: {
    maxWidth: '700px',
    margin: '30px auto',
    padding: '0 20px',
  },
  subtitle: {
    color: 'var(--text-secondary, #718096)',
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
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    fontSize: '14px',
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
    borderRadius: '10px',
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
    borderRadius: '10px',
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
    borderRadius: '10px',
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
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    width: 'auto',
    whiteSpace: 'nowrap',
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
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default ReportIssue;