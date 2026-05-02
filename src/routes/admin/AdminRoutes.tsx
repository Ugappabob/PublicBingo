import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Dashboard } from '../../components/admin/Dashboard';
import { CreateGame } from '../../components/admin/CreateGame';
import { GameTemplates } from '../../components/admin/GameTemplates';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser extends User {
  isAdmin?: boolean;
}

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!(currentUser as AdminUser)?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedAdminRoute>
            <Dashboard />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<div>Overview Dashboard</div>} />
        <Route path="games" element={<div>Games List</div>} />
        <Route path="games/create" element={<CreateGame />} />
        <Route path="templates" element={<GameTemplates />} />
        <Route path="templates/create" element={<div>Create Template</div>} />
        <Route path="users" element={<div>User Management</div>} />
        <Route path="settings" element={<div>Admin Settings</div>} />
        <Route path="monitoring" element={<div>System Monitoring</div>} />
      </Route>
    </Routes>
  );
}; 