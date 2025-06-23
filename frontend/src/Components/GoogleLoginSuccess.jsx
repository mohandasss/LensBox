import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleLoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log(token);
    if (token) {
        navigate("/");
      localStorage.setItem("token", token);
      
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default GoogleLoginSuccess;
