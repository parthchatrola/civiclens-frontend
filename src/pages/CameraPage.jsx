import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CameraPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [error, setError] = useState('');

  // ===== START CAMERA =====
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  };

  // ===== STOP CAMERA =====
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
  };

  // ===== CAPTURE PHOTO =====
  const capturePhoto = () => {
    if (!videoRef.current || !isCameraReady) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    
    // Mirror the image if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    setIsCapturing(false);
    stopCamera();
  };

  // ===== FLIP CAMERA =====
  const flipCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    stopCamera();
    // Start camera with new mode after a small delay
    setTimeout(() => startCamera(), 300);
  };

  // ===== USE PHOTO (Go back to report page) =====
  const usePhoto = () => {
    navigate('/report-issue', { state: { capturedImage } });
  };

  // ===== RETAKE PHOTO =====
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // ===== GO BACK =====
  const goBack = () => {
    stopCamera();
    navigate(-1);
  };

  // ===== START CAMERA ON MOUNT =====
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && isCameraReady && !capturedImage) {
        capturePhoto();
      }
      if (e.key === 'Escape') {
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCameraReady, capturedImage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.container}
    >
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={styles.header}
      >
        <button onClick={goBack} style={styles.closeBtn}>✕</button>
        <span style={styles.headerTitle}>📷 Camera</span>
        {isCameraReady && !capturedImage && (
          <button onClick={flipCamera} style={styles.flipBtn}>
            🔄 Flip
          </button>
        )}
      </motion.div>

      {/* ===== CAMERA VIEWFINDER ===== */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        style={styles.viewfinder}
      >
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              style={{
                ...styles.video,
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
              }}
              playsInline
              autoPlay
              muted
            />
            {!isCameraReady && !error && (
              <div style={styles.loadingOverlay}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  style={styles.spinner}
                />
                <p style={styles.loadingText}>Starting camera...</p>
              </div>
            )}
            {error && (
              <div style={styles.errorOverlay}>
                <span style={styles.errorIcon}>⚠️</span>
                <p style={styles.errorText}>{error}</p>
                <button onClick={startCamera} style={styles.retryBtn}>Retry</button>
              </div>
            )}
            {/* Grid Overlay (Rule of Thirds) */}
            <div style={styles.gridOverlay}>
              <div style={styles.gridLineHorizontal} />
              <div style={styles.gridLineHorizontal2} />
              <div style={styles.gridLineVertical} />
              <div style={styles.gridLineVertical2} />
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={styles.previewContainer}
          >
            <img src={capturedImage} alt="Captured" style={styles.previewImage} />
            <div style={styles.previewActions}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={retakePhoto}
                style={styles.retakeBtn}
              >
                🔄 Retake
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={usePhoto}
                style={styles.useBtn}
              >
                ✅ Use Photo
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </motion.div>

      {/* ===== CAPTURE BUTTON ===== */}
      {isCameraReady && !capturedImage && !error && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
          style={styles.captureSection}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: isCapturing ? [1, 1.2, 1] : 1,
            }}
            transition={{
              scale: { duration: 0.5, ease: 'easeInOut' },
            }}
            onClick={capturePhoto}
            disabled={!isCameraReady || isCapturing}
            style={{
              ...styles.captureBtn,
              opacity: isCapturing ? 0.6 : 1,
            }}
          >
            <motion.div
              animate={{
                scale: isCapturing ? [1, 1.5, 1] : 1,
              }}
              transition={{
                scale: { duration: 0.3, ease: 'easeInOut' },
              }}
              style={styles.captureInner}
            />
          </motion.button>
          <p style={styles.captureHint}>Press Enter or tap to capture</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ===== STYLES =====
const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#000000',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 4px',
    zIndex: 10,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.3s',
  },
  headerTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  flipBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    fontWeight: '500',
    transition: 'background 0.3s',
  },
  viewfinder: {
    flex: 1,
    width: '100%',
    maxWidth: '500px',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    background: '#1a1a1a',
    aspectRatio: '4/3',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: '#111',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: '4px solid #48bb78',
    borderRadius: '50%',
  },
  loadingText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.85)',
    gap: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  errorIcon: { fontSize: '48px' },
  errorText: {
    color: 'white',
    fontSize: '16px',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
  retryBtn: {
    padding: '10px 30px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Grid Overlay (Rule of Thirds)
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    opacity: 0.3,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: '1px',
    background: 'rgba(255,255,255,0.5)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66.66%',
    height: '1px',
    background: 'rgba(255,255,255,0.5)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: '1px',
    background: 'rgba(255,255,255,0.5)',
  },
  gridLineVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66.66%',
    width: '1px',
    background: 'rgba(255,255,255,0.5)',
  },
  // Preview
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewActions: {
    position: 'absolute',
    bottom: '30px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '0 20px',
  },
  retakeBtn: {
    padding: '12px 30px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  useBtn: {
    padding: '12px 30px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(72,187,120,0.3)',
  },
  // Capture Button
  captureSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
  },
  captureBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: '4px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border 0.3s',
    padding: '6px',
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'white',
  },
  captureHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    margin: 0,
  },
};

export default CameraPage;