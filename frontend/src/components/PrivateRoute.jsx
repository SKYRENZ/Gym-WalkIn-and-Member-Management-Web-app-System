
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const staffToken = localStorage.getItem('staffToken');
  const staffRole = localStorage.getItem('staffRole');

  if (!staffToken) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (requiredRole && staffRole !== requiredRole) {
    // Logged in but wrong role, redirect to appropriate page
    return <Navigate to={staffRole === 'admin' ? '/admin' : '/counter'} replace />;
  }

  return children;
};

export default PrivateRoute;