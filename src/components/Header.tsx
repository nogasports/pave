import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../lib/firebase/auth';
import { useNotifications } from '../contexts/NotificationContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {location.pathname.startsWith('/staff') && (
              <button
                onClick={() => navigate('/staff/profile')}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <User className="h-5 w-5 mr-2" />
                <span>My Profile</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;