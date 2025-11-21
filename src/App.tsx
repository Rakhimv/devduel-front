import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { CodeProvider } from './context/CodeContext';
import GameNavigationGuard from './components/GameNavigationGuard';
import MaintenanceGuard from './components/MaintenanceGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import PrivateRout from './routes/PrivateRoute';
import UserExRoute from './routes/UserExRoute';
import TitleAnimation from './components/ui/TitleAnimation';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Rating from './pages/Rating';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Banned from './pages/Banned';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { HeaderLayout } from './layouts/HeaderLayout';
import MobileWarning from './components/MobileWarning';
import AppVersion from './components/AppVersion';
import { useState, useEffect } from 'react';

function AppContent() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile && location.pathname !== '/') {
    return <MobileWarning />;
  }

  return (
    <Routes>
      <Route path='/anim' element={<TitleAnimation />} />

      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      <Route element={<UserExRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/banned" element={<Banned />} />
      </Route>

      <Route element={<PrivateRout />}>
        <Route path="/admin" element={
          <HeaderLayout>
            <Admin />
          </HeaderLayout>
        } />
        
        <Route element={<MaintenanceGuard />}>
          <Route path="/app/" element={<Navigate to="/app/msg" replace />} />
          <Route path="/app" element={<Navigate to="/app/msg" replace />} />
          <Route path="/app/msg/" element={<Dashboard />} />
          <Route path="/app/msg/:id" element={<Dashboard />} />
          <Route path="/rating" element={
            <HeaderLayout>
              <Rating />
            </HeaderLayout>
          } />
          <Route path="/profile" element={
            <HeaderLayout>
              <Profile />
            </HeaderLayout>
          } />
          <Route path="/game/:sessionId" element={
            <HeaderLayout>
              <Game />
            </HeaderLayout>
          } />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <CodeProvider>
            <GameNavigationGuard>
              <AppContent />
              <AppVersion />
            </GameNavigationGuard>
          </CodeProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;