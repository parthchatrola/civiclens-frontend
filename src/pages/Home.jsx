import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// ===== ANIMATION VARIANTS =====
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div style={styles.container}>
      {/* ===== NAVBAR ===== */}
      <nav style={styles.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={styles.navLogo}>
            <span style={styles.logoIcon}>🏙️</span>
            <span style={styles.logoText}>CivicLens</span>
          </div>
        </Link>
        <div style={styles.navLinks}>
          <a href="#home" style={styles.navLink}>Home</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#how-it-works" style={styles.navLink}>How It Works</a>
          <a href="#help" style={styles.navLink}>Help</a>
          
          {/* Dark Mode Toggle */}
          <button onClick={toggleTheme} style={styles.themeBtn}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <Link to="/login">
            <button style={styles.navBtn}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{ ...styles.navBtn, ...styles.navBtnPrimary }}>Register</button>
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section id="home" style={{
        ...styles.hero,
        backgroundImage: `url("https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        minHeight: '100vh',
      }}>
        <div style={{
          ...styles.heroOverlay,
          background: theme === 'light' 
            ? 'rgba(255, 255, 255, 0.85)' 
            : 'rgba(26, 32, 44, 0.80)',
        }} />
        
        <div style={styles.heroContent}>
          {/* ===== LEFT SIDE ===== */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={styles.heroLeft}
          >
            <motion.h1
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{
                ...styles.heroTitle,
                fontSize: '56px',
                fontWeight: '800',
              }}
            >
              Make Your City
              <br />
              <span style={styles.heroHighlight}>Better, Together</span>
            </motion.h1>
            
            <p style={{
              ...styles.heroDesc,
              fontSize: '19px',
              maxWidth: '480px',
            }}>
              Report civic issues, track progress, and celebrate solutions – 
              all in one smart platform.
            </p>
            
            <div style={styles.heroButtons}>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.heroBtn}
                >
                  Start Reporting 🚀
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ ...styles.heroBtn, ...styles.heroBtnOutline }}
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '25px',
              marginTop: '30px',
            }}>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1a202c)', margin: 0 }}>100+</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4a5568)', margin: 0 }}>Issues Resolved</p>
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1a202c)', margin: 0 }}>87%</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4a5568)', margin: 0 }}>Resolution Rate</p>
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1a202c)', margin: 0 }}>4.8⭐</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4a5568)', margin: 0 }}>User Rating</p>
              </div>
            </div>
          </motion.div>

          {/* ===== RIGHT SIDE: Icon Grid with Hover ===== */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={styles.heroRight}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              width: '100%',
              maxWidth: '450px',
            }}>
              {[
                { icon: '📸', label: 'Snap & Report', desc: 'Upload photo in seconds' },
                { icon: '🤖', label: 'AI Auto-Tag', desc: 'Smart category detection' },
                { icon: '📍', label: 'Live Map', desc: 'Track complaints visually' },
                { icon: '📊', label: 'City Analytics', desc: 'See trends & insights' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    padding: '20px 14px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    textAlign: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(72, 187, 120, 0.2)';
                    e.currentTarget.style.borderColor = '#48bb78';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '6px', transition: 'transform 0.3s' }}>{item.icon}</div>
                  <h4 style={{ color: 'var(--text-primary, #1a202c)', margin: '0', fontSize: '15px' }}>{item.label}</h4>
                  <p style={{ color: 'var(--text-secondary, #4a5568)', fontSize: '12px', margin: '4px 0 0' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>About CivicLens</h2>
          <p style={styles.sectionSubtitle}>Empowering citizens, connecting with authorities, building smarter cities.</p>
          <div style={styles.divider} />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={styles.featuresGrid}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              style={{
                ...styles.featureCard,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(72, 187, 120, 0.2)';
                e.currentTarget.style.borderColor = '#48bb78';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ ...styles.section, ...styles.greyBg }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>Three simple steps to report and resolve civic issues in your city.</p>
          <div style={styles.divider} />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={styles.stepsContainer}
        >
          <motion.div variants={fadeInUp} style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>📝 Report Issue</h3>
            <p style={styles.stepDesc}>Upload a photo, select category, add description, and share your location.</p>
          </motion.div>
          <motion.div variants={fadeInUp} style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>👮 Authority Response</h3>
            <p style={styles.stepDesc}>Complaints are verified, assigned to officers, and action is taken.</p>
          </motion.div>
          <motion.div variants={fadeInUp} style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>✅ Track Progress</h3>
            <p style={styles.stepDesc}>Monitor your complaint's journey until it is resolved successfully.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="help" style={{ ...styles.section, ...styles.greyBg }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p style={styles.sectionSubtitle}>Find quick answers to common questions about CivicLens.</p>
          <div style={styles.divider} />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={styles.faqContainer}
        >
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={fadeInUp} style={styles.faqItem}>
              <div
                style={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                <span style={styles.faqQuestionText}>{faq.question}</span>
                <span style={styles.faqIcon}>{faqOpen === index ? '−' : '+'}</span>
              </div>
              <div style={{ ...styles.faqAnswer, maxHeight: faqOpen === index ? '200px' : '0' }}>
                <p style={styles.faqAnswerText}>{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          {/* Column 1: Brand */}
          <div style={styles.footerCol}>
            <h3 style={styles.footerHeading}>🏙️ CivicLens</h3>
            <p style={styles.footerText}>Empowering citizens to report and track civic issues in real-time.</p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Quick Links</h4>
            <a href="#home" style={styles.footerLink}>Home</a>
            <a href="#about" style={styles.footerLink}>About</a>
          </div>
          
          {/* Column 3: Condition */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Condition</h4>
            <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
          </div>
          
          {/* Column 4: Connect */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Connect</h4>
            <a href="mailto:support@civiclens.com" style={styles.footerLink}>📧 support@civiclens.com</a>
            <a href="tel:+919876543210" style={styles.footerLink}>📞 +91 98765 43210</a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerBottomText}>© 2026 CivicLens. All rights reserved. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
};

// ===== DATA =====
const features = [
  { icon: '📱', title: 'Easy Reporting', desc: 'Report issues in seconds with photos, GPS location, and category selection.' },
  { icon: '📊', title: 'Real-time Tracking', desc: 'Track your complaints from submission to resolution with live status updates.' },
  { icon: '👮', title: 'Officer Assignment', desc: 'Issues are assigned to the right authorities for faster resolution.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Admin dashboards with charts and reports for better city management.' },
  { icon: '🤖', title: 'AI Classification', desc: 'AI automatically categorizes issues for faster processing and routing.' },
  { icon: '💬', title: 'Community Comments', desc: 'Citizens can comment, upvote, and engage on active complaints.' },
];

const faqs = [
  { question: 'What types of issues can I report?', answer: 'You can report potholes, garbage dumping, water leakage, street light failures, fallen trees, traffic signal damage, sewage problems, and more.' },
  { question: 'How do I track my complaint status?', answer: 'After logging in, go to the "Track" section. Click on any complaint card to view its current status and detailed timeline.' },
  { question: 'Who resolves the complaints?', answer: 'Complaints are assigned to relevant authorities and officers based on the category.' },
  { question: 'Is my location data secure?', answer: 'Yes! Your location data is used only for mapping complaints. We do not share your personal information.' },
  { question: 'Can I add images to my complaint?', answer: 'Absolutely! When reporting an issue, you can upload photos to help authorities understand the problem better.' },
];

// ===== STYLES =====
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    color: 'var(--text-primary, #1a202c)',
    overflowX: 'hidden',
    background: 'var(--bg-primary, #ffffff)',
    transition: 'background 0.3s, color 0.3s',
  },
  // Navbar
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    background: 'var(--bg-secondary, #ffffff)',
    boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border-color 0.3s',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: '700',
  },
  logoIcon: { fontSize: '28px' },
  logoText: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  },
  navLink: {
    color: 'var(--text-secondary, #4a5568)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'color 0.3s',
  },
  themeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    width: 'auto',
    padding: '4px 8px',
    transition: 'transform 0.2s',
  },
  navBtn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '2px solid #48bb78',
    borderRadius: '8px',
    color: '#48bb78',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'auto',
    transition: 'all 0.3s',
  },
  navBtnPrimary: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
  },
  // Hero
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '100px 40px 60px',
    width: '100%',
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    transition: 'background 0.3s ease',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '40px',
  },
  heroLeft: { flex: 1 },
  heroRight: { flex: 1, display: 'flex', justifyContent: 'center',alignItems: 'center',width: '100%' },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '800',
    lineHeight: '1.2',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '20px',
  },
  heroHighlight: {
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: '18px',
    color: 'var(--text-secondary, #4a5568)',
    lineHeight: '1.8',
    maxWidth: '500px',
    marginBottom: '30px',
  },
  heroButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  heroBtn: {
    padding: '14px 36px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'auto',
    boxShadow: '0 4px 20px rgba(72,187,120,0.3)',
    transition: 'transform 0.3s',
  },
  heroBtnOutline: {
    background: 'transparent',
    border: '2px solid #48bb78',
    color: '#48bb78',
    boxShadow: 'none',
  },
  // Sections
  section: {
    padding: '80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'background 0.3s',
  },
  greyBg: {
    background: 'var(--bg-secondary, #f7fafc)',
    transition: 'background 0.3s',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '8px',
    transition: 'color 0.3s',
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary, #4a5568)',
    transition: 'color 0.3s',
  },
  divider: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    borderRadius: '2px',
    margin: '15px auto 0',
  },
  // Features
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    background: 'var(--bg-card, white)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    textAlign: 'center',
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
  },
  featureIcon: { fontSize: '40px', marginBottom: '15px' },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '8px',
    transition: 'color 0.3s',
  },
  featureDesc: {
    color: 'var(--text-secondary, #4a5568)',
    lineHeight: '1.6',
    transition: 'color 0.3s',
  },
  // Steps
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  step: {
    textAlign: 'center',
    padding: '30px',
    background: 'var(--bg-card, white)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s',
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
    borderRadius: '50%',
    color: 'white',
    fontSize: '24px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary, #1a202c)',
    marginBottom: '8px',
    transition: 'color 0.3s',
  },
  stepDesc: {
    color: 'var(--text-secondary, #4a5568)',
    lineHeight: '1.6',
    transition: 'color 0.3s',
  },
  // FAQ
  faqContainer: { maxWidth: '800px', margin: '0 auto' },
  faqItem: {
    background: 'var(--bg-card, white)',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    border: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background 0.3s, border 0.3s',
  },
  faqQuestion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    cursor: 'pointer',
  },
  faqQuestionText: {
    fontWeight: '600',
    fontSize: '16px',
    color: 'var(--text-primary, #1a202c)',
    transition: 'color 0.3s',
  },
  faqIcon: {
    fontSize: '24px',
    color: '#48bb78',
  },
  faqAnswer: {
    overflow: 'hidden',
    transition: 'max-height 0.4s ease-in-out',
    padding: '0 24px',
  },
  faqAnswerText: {
    paddingBottom: '18px',
    color: 'var(--text-secondary, #4a5568)',
    lineHeight: '1.6',
    transition: 'color 0.3s',
  },
  // Footer
  footer: {
    background: '#1a202c',
    color: '#cbd5e0',
    padding: '50px 40px 20px',
    marginTop: '60px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
  },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerHeading: { color: 'white', fontSize: '18px', marginBottom: '4px' },
  footerText: { color: '#a0aec0', fontSize: '14px', lineHeight: '1.6' },
  footerLink: {
    color: '#a0aec0',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '30px auto 0',
    paddingTop: '20px',
    borderTop: '1px solid #2d3748',
    textAlign: 'center',
  },
  footerBottomText: { fontSize: '14px', color: '#718096' },
};

export default Home;