import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { CodeProvider } from './context/CodeContext';
import GameNavigationGuard from './components/GameNavigationGuard';
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
import { HeaderLayout } from './layouts/HeaderLayout';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <CodeProvider>
            <GameNavigationGuard>
              <Routes>
                <Route path='/anim' element={<TitleAnimation />} />

                {/* Лендинг - доступен всем */}
                <Route path="/" element={<Landing />} />

                <Route element={<UserExRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/banned" element={<Banned />} />
                </Route>

                {/* Защищенные маршруты - требуют авторизации */}
                <Route element={<PrivateRout />}>
                  <Route path="/app" element={<Dashboard />} />
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
                  <Route path="/admin" element={
                    <HeaderLayout>
                      <Admin />
                    </HeaderLayout>
                  } />
                </Route>
              </Routes>
            </GameNavigationGuard>
          </CodeProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;