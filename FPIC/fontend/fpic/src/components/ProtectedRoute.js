// components/ProtectedRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "./../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { user, hasRole } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (requiredRoles && !hasRole(requiredRoles))
    return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
