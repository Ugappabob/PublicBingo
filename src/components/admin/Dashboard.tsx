import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardSection {
  id: string;
  title: string;
  icon: string;
  path: string;
}

const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: '📊',
    path: '/admin/dashboard'
  },
  {
    id: 'games',
    title: 'Games',
    icon: '🎮',
    path: '/admin/games'
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: '📋',
    path: '/admin/templates'
  },
  {
    id: 'users',
    title: 'Users',
    icon: '👥',
    path: '/admin/users'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    path: '/admin/settings'
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    icon: '📈',
    path: '/admin/monitoring'
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const getCurrentSection = () => {
    const path = location.pathname;
    return DASHBOARD_SECTIONS.find(section => 
      path === section.path || path.startsWith(`${section.path}/`)
    ) || DASHBOARD_SECTIONS[0];
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="admin-error">
        <h2>Access Denied</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  const currentSection = getCurrentSection();

  return (
    <div className={`admin-dashboard ${isNavOpen ? 'nav-open' : 'nav-closed'}`}>
      <nav className="dashboard-nav">
        <div className="nav-header">
          <h2>Admin Dashboard</h2>
          <button className="nav-toggle" onClick={toggleNav}>
            {isNavOpen ? '◀' : '▶'}
          </button>
        </div>
        <div className="nav-sections">
          {DASHBOARD_SECTIONS.map(section => (
            <div
              key={section.id}
              className={`nav-item ${currentSection.id === section.id ? 'active' : ''}`}
              onClick={() => handleNavigation(section.path)}
            >
              <span className="nav-icon">{section.icon}</span>
              {isNavOpen && <span className="nav-title">{section.title}</span>}
            </div>
          ))}
        </div>
        <div className="nav-footer">
          <div className="user-info">
            {isNavOpen && (
              <>
                <span className="user-name">{currentUser.displayName}</span>
                <span className="user-role">Administrator</span>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="content-header">
          <h1>{currentSection.title}</h1>
          <div className="header-actions">
            {currentSection.id === 'games' && (
              <button className="primary-button" onClick={() => navigate('/admin/games/create')}>
                Create New Game
              </button>
            )}
            {currentSection.id === 'templates' && (
              <button className="primary-button" onClick={() => navigate('/admin/templates/create')}>
                Create Template
              </button>
            )}
          </div>
        </header>

        <div className="content-body">
          {/* Content will be rendered by child routes */}
        </div>
      </main>
    </div>
  );
}; 