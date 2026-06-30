// Step 8.1: Logout Button Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if API call fails
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="logout-btn"
      disabled={isLoading}
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

// Step 8.2: Auto-logout component (redirects immediately)
export const AutoLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    performLogout();
  }, [logout, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
      <p>Logging out...</p>
    </div>
  );
};

export default LogoutButton;