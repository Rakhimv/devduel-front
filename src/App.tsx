import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import GameNavigationGuard from './components/GameNavigationGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRout from './routes/PrivateRoute';
import UserExRoute from './routes/UserExRoute';
import TitleAnimation from './components/ui/TitleAnimation';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Rating from './pages/Rating';
import Profile from './pages/Profile';
import { HeaderLayout } from './layouts/HeaderLayout';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <GameNavigationGuard>
            <Routes>
              <Route path='/anim' element={<TitleAnimation />} />

              <Route element={<UserExRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<PrivateRout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/msg/" element={<Dashboard />} />
                <Route path="/msg/:id" element={<Dashboard />} />
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
            </Routes>
          </GameNavigationGuard>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;