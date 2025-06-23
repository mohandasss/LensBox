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
import FormPage from './Page/FormPage';
import ServiceMotor from './Page/ServiceMotor';
import ProductDetailsPage from './Page/ProductDetailsPage';
import CartPage from './Page/CartPage';
import ProfilePage from './Page/ProfilePage';
import GoogleLoginSuccess from './Components/GoogleLoginSuccess';
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
      <Route path="/google-login-success" element={<GoogleLoginSuccess />} />

      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/about' element={<Aboutpage />} />
      <Route path='/contact' element={<ContactPage />} /> 
      <Route path='/services' element={<ServicesPage />} /> 
      <Route path='/products' element={<ProductsPage />} /> 
      <Route path='/Cart' element={<CartPage />} /> 
      <Route path='/form' element={<FormPage />} /> 
      <Route path='/profile' element={<ProfilePage />} /> 
      

      
      <Route path='/product/:id' element={<ProductDetailsPage />} />
      <Route path='/service-motor' element={<ServiceMotor />} /> 
    </Routes>
  );
}

export default App;
