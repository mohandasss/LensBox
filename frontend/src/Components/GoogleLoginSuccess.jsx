import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleLoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
      // Immediate redirect to home page
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default GoogleLoginSuccess;
