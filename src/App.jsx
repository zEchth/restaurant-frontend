import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import POS from './pages/POS';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Wrap halaman protected dengan MainLayout
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard kita arahkan ke POS dulu karena belum buat Dashboard Chart */}
          <Route path="/dashboard" element={<Navigate to="/pos" replace />} />

          {/* Halaman POS */}
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/pos" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </AuthProvider>
  );
}

export default App;