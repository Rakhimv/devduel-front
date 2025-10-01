import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRout from './routes/PrivateRoute';
import UserExRoute from './routes/UserExRoute';
import TitleAnimation from './components/ui/TitleAnimation';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/anim' element={<TitleAnimation />} />

        <Route path="/*" element={
          <AuthProvider>
            <Routes>
              <Route element={<UserExRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<PrivateRout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/msg/:id" element={<Dashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;