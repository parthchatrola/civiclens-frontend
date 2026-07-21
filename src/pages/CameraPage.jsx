import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CameraPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ===== START CAMERA =====
  const startCamera = useCallback(async () => {
    try {
      setError('');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
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
  }, [facingMode]);

  // ===== STOP CAMERA =====
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    setIsCameraReady(false);
  }, []);

  // ===== CAPTURE PHOTO =====
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !isCameraReady) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL("image/jpeg");
    const blob = await (await fetch(imageData)).blob();
    const file = new File([blob], "camera.jpg", { type: "image/jpeg" });

    navigate("/report-issue", {
      state: { capturedImage: file }
    });
  }, [isCameraReady, facingMode, navigate]);

  // ===== FLIP CAMERA =====
  const flipCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    stopCamera();
  }, [facingMode, stopCamera]);

  // ===== USE PHOTO =====
  const usePhoto = useCallback(() => {
    navigate('/report-issue', { state: { capturedImage } });
  }, [capturedImage, navigate]);

  // ===== RETAKE PHOTO =====
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // ===== GO BACK =====
  const goBack = useCallback(() => {
    stopCamera();
    navigate(-1);
  }, [stopCamera, navigate]);

  // ===== START CAMERA ON MOUNT =====
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

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
  }, [isCameraReady, capturedImage, capturePhoto, goBack]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...styles.container,
        padding: isMobile ? '12px' : '20px',
      }}
    >
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          ...styles.header,
          padding: isMobile ? '4px 0' : '8px 4px',
        }}
      >
        <button
          onClick={goBack}
          style={{
            ...styles.closeBtn,
            width: isMobile ? '36px' : '44px',
            height: isMobile ? '36px' : '44px',
            fontSize: isMobile ? '18px' : '20px',
          }}
        >
          ✕
        </button>
        <span style={{
          ...styles.headerTitle,
          fontSize: isMobile ? '16px' : '18px',
        }}>
          📷 Camera
        </span>
        {isCameraReady && !capturedImage && (
          <button
            onClick={flipCamera}
            style={{
              ...styles.flipBtn,
              padding: isMobile ? '6px 14px' : '8px 16px',
              fontSize: isMobile ? '13px' : '14px',
            }}
          >
            🔄 Flip
          </button>
        )}
      </motion.div>

      {/* ===== CAMERA VIEWFINDER ===== */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          ...styles.viewfinder,
          borderRadius: isMobile ? '16px' : '24px',
        }}
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
                  style={{
                    ...styles.spinner,
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                  }}
                />
                <p style={{
                  ...styles.loadingText,
                  fontSize: isMobile ? '14px' : '16px',
                }}>
                  Starting camera...
                </p>
              </div>
            )}
            {error && (
              <div style={styles.errorOverlay}>
                <span style={styles.errorIcon}>⚠️</span>
                <p style={{
                  ...styles.errorText,
                  fontSize: isMobile ? '14px' : '16px',
                }}>
                  {error}
                </p>
                <button onClick={startCamera} style={{
                  ...styles.retryBtn,
                  padding: isMobile ? '8px 24px' : '10px 30px',
                  fontSize: isMobile ? '14px' : '16px',
                }}>
                  Retry
                </button>
              </div>
            )}
            {/* Grid Overlay */}
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
            <div style={{
              ...styles.previewActions,
              bottom: isMobile ? '20px' : '30px',
              gap: isMobile ? '12px' : '20px',
              padding: isMobile ? '0 12px' : '0 20px',
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={retakePhoto}
                style={{
                  ...styles.retakeBtn,
                  padding: isMobile ? '10px 20px' : '12px 30px',
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                🔄 Retake
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={usePhoto}
                style={{
                  ...styles.useBtn,
                  padding: isMobile ? '10px 20px' : '12px 30px',
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                ✅ Use Photo
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </motion.div>

      {/* ===== CAPTURE BUTTON ===== */}
      {isCameraReady && !capturedImage && !error && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            ...styles.captureSection,
            paddingBottom: isMobile ? '12px' : '20px',
            gap: isMobile ? '8px' : '12px',
          }}
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
              width: isMobile ? '60px' : '72px',
              height: isMobile ? '60px' : '72px',
              borderWidth: isMobile ? '3px' : '4px',
              padding: isMobile ? '4px' : '6px',
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
          <p style={{
            ...styles.captureHint,
            fontSize: isMobile ? '12px' : '13px',
          }}>
            Press Enter or tap to capture
          </p>
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
    flex: 1,                           // fills remaining space
    width: '100%',                     // full width
    maxWidth: '100%',                  // no max width constraint
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    background: '#1a1a1a',
    // No fixed aspect ratio – let it fill freely
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',                // covers container, crops to fill
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