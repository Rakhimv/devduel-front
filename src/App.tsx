import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Dashboard';
import Register from './pages/Register';
import PrivateRout from './routes/PrivateRoute';
import UserExRoute from './routes/UserExRoute';
import TitleAnimation from './components/ui/TitleAnimation';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path='/anim' element={<TitleAnimation />} />

          <Route element={<UserExRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRout />}>
            <Route path="/" element={<Home />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;