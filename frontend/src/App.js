import './App.css';
import HomePage from './Page/HomePage';
import Login from './Components/Login';
import Register from './Components/Register';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from './Components/Loader';
import Aboutpage from './Page/Aboutpage';
import ContactPage from './Page/ContactPage';
import ServicesPage from './Page/ServicesPage';
import ProductsPage from './Page/ProductsPage';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/about' element={<Aboutpage />} />
      <Route path='/contact' element={<ContactPage />} /> 
      <Route path='/services' element={<ServicesPage />} /> 
      <Route path='/products' element={<ProductsPage />} /> 
    </Routes>
  );
}

export default App;
