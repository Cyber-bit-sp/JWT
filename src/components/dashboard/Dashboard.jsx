// Step 9.1: Dashboard Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosConfig';
import LogoutButton from '../auth/Logout';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step 9.2: Fetch protected data
  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/data');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  // Step 9.3: Render dashboard
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="dashboard-content">
        <div className="user-info">
          <h2>Welcome, {user?.name || user?.email}!</h2>
          <p>Role: {user?.role || 'User'}</p>
          <p>Email: {user?.email}</p>
        </div>

        {loading && <div>Loading dashboard data...</div>}
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {data && (
          <div className="dashboard-data">
            <h3>Protected Data</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>

      <style>{`
        .dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        .dashboard-header h1 {
          margin: 0;
        }
        .logout-btn {
          padding: 0.5rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .logout-btn:hover {
          background: #c82333;
        }
        .user-info {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .user-info h2 {
          margin-top: 0;
        }
        .dashboard-data {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .dashboard-data pre {
          background: #fff;
          padding: 1rem;
          border-radius: 4px;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;