import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import FileBrowser from './components/FileBrowser';
import MeetingBoard from './components/MeetingBoard';
import UploadModal from './components/UploadModal';
import UserSettings from './components/UserSettings';
import SecuritySettings from './components/SecuritySettings';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserManagement from './components/UserManagement';
import Notifications from './components/Notifications';
import TrashScreen from './components/TrashScreen';
import CategoriesScreen from './components/CategoriesScreen';
import SharedWithMe from './components/SharedWithMe';
import SupportScreen from './components/SupportScreen';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import UmatLogo from './assets/Umatlogo.png';
import landicon from './assets/landicon.jpg';
import { motion, AnimatePresence } from 'framer-motion';
// import { ShieldCheck, Info } from 'lucide-react';

function App() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [currentAuthView, setCurrentAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  const trivia = [
    "UMAT was founded as the Tarkwa Technical Institute in 1952.",
    "The university's motto is 'Knowledge, Resilience, and Service'.",
    "UMAT became a fully-fledged university in 2004.",
    "ShareHub uses military-grade 256-bit encryption for all academic files.",
    "Secure collaboration is the heart of UMAT's digital sovereignty."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200); // Reduced final delay
          return 100;
        }
        return prev + Math.random() * 40; // Increased increment speed
      });
    }, 50); // Reduced interval time

    const triviaInterval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % trivia.length);
    }, 1500); // Faster trivia cycle just in case

    return () => {
      clearInterval(interval);
      clearInterval(triviaInterval);
    };
  }, [trivia.length]);

  const handleLogout = async () => {
    await signOut();
    setCurrentAuthView('landing');
  };

  const renderContent = () => {
    const isAdmin = profile?.role === 'Admin';

    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} setActiveTab={setActiveTab} />;
      case 'All Files':
        return <FileBrowser />;
      case 'Categories':
        return <CategoriesScreen />;
      case 'Shared with me':
        return <SharedWithMe />;
      case 'Meetings':
        return <MeetingBoard />;
      case 'Notifications':
        return <Notifications />;
      case 'Trash':
        return <TrashScreen />;
      case 'User Management':
        return isAdmin ? <UserManagement /> : <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} setActiveTab={setActiveTab} />;
      case 'Analytics':
        return isAdmin ? <AnalyticsDashboard /> : <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} setActiveTab={setActiveTab} />;
      case 'Account Security':
        return <SecuritySettings />;
      case 'Profile Settings':
        return <UserSettings />;
      case 'Help & Support':
        return <SupportScreen />;
      default:
        return <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} setActiveTab={setActiveTab} />;
    }
  }

  const isLoggedIn = !!user && profile?.status === 'Active';

  useEffect(() => {
    // Basic routing logic if needed
  }, [isLoggedIn, authLoading, loading]);

  if (authLoading || loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Image with Parallax & Blur */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 10, ease: "easeOut" }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${landicon})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) brightness(0.25)',
            zIndex: 0
          }}></motion.div>

        {/* Overlay Gradients */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(0, 104, 55, 0.4) 0%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1
        }}></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ zIndex: 2, textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 20px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            animation: 'float 6s ease-in-out infinite'
          }}>
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              boxShadow: '0 0 50px rgba(0, 107, 63, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <img
                src={UmatLogo}
                alt="UMAT Logo"
                style={{ width: '100px', height: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>

          <h2 className="playfair" style={{ color: 'white', letterSpacing: '4px', fontSize: '1.8rem', marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            UMAT SHAREHUB
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '40px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Secure Board Portal System
          </p>

          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.75rem', color: 'var(--umat-gold)', fontWeight: 600 }}>
              <span className="mono">SYSTEM INITIALIZATION</span>
              <span className="mono">{Math.round(loadingProgress)}%</span>
            </div>
            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--umat-gold), #fff)', width: `${loadingProgress}%`, boxShadow: '0 0 10px var(--umat-gold)' }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
            </div>
          </div>

          <div style={{ marginTop: '50px', height: '40px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={triviaIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: 'rgba(0, 70, 30, 0.4)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'inline-block'
                }}
              >
                <p className="mono" style={{ color: '#aaa', fontSize: '0.75rem', margin: 0 }}>
                  <span style={{ color: 'var(--umat-gold)', marginRight: '8px' }}>Did You Know?</span>
                  {trivia[triviaIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {isLoggedIn && (
        <header className="show-mobile" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          padding: '12px 20px',
          borderBottom: '1px solid var(--glass-border)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={UmatLogo} alt="Logo" style={{ width: '30px' }} />
            <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>ShareHub</h2>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>
      )}

      {isLoggedIn && mobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {!isLoggedIn ? (
        <AnimatePresence mode="wait">
          {currentAuthView === 'landing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="landing">
              <LandingPage
                onEnterPortal={() => setCurrentAuthView('login')}
                onLoginClick={() => setCurrentAuthView('login')}
                onRegisterClick={() => setCurrentAuthView('register')}
              />
            </motion.div>
          )}
          {currentAuthView === 'login' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="login">
              <LoginScreen
                onGoBack={() => setCurrentAuthView('landing')}
                onSwitchToRegister={() => setCurrentAuthView('register')}
              />
            </motion.div>
          )}
          {currentAuthView === 'register' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="register">
              <RegisterScreen
                onRegisterSuccess={() => setCurrentAuthView('login')}
                onGoBack={() => setCurrentAuthView('landing')}
                onSwitchToLogin={() => setCurrentAuthView('login')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="dashboard-grid" style={{
          gridTemplateColumns: sidebarCollapsed ? '120px 1fr' : '320px 1fr',
          transition: 'grid-template-columns 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileSidebarOpen(false);
            }}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onUploadClick={() => {
              setIsUploadModalOpen(true);
              setMobileSidebarOpen(false);
            }}
            onLogout={handleLogout}
            isMobileOpen={mobileSidebarOpen}
          />
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
          >
            {renderContent()}
          </motion.div>

          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
