import './App.css';
import HomePage from './Page/HomePage';
import Login from './Components/Login';
import Register from './Components/Register';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from './Components/Loader';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <LoadingWrapper>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </LoadingWrapper>
      </BrowserRouter>
    </div>
  );
}

function LoadingWrapper({ children }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 150); // 1 second

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  );
}

export default App;
